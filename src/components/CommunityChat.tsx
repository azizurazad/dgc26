import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hash, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  CornerUpLeft, 
  Paperclip, 
  Smile, 
  Pin, 
  Search, 
  Users, 
  Calendar, 
  X, 
  MessageSquare, 
  LogOut, 
  Shield, 
  Image as ImageIcon, 
  Send, 
  CheckCheck, 
  Plus,
  Bell,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Student, ChatMessage } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

interface Channel {
  id: string;
  name: string;
  locked: boolean;
}

interface CommunityChatProps {
  currentUser: Student | null;
  students: Student[];
  onBackToSite: () => void;
}

// Fixed preloaded upcoming events for the sidebar
const UPCOMING_EVENTS = [
  { id: '1', title: 'National Botany Seminar 2026', date: 'July 25' },
  { id: '2', title: 'Sunderbans Estuary Field Trip', date: 'August 12' },
  { id: '3', title: 'Practical Lab Assessment Session', date: 'August 18' }
];

export default function CommunityChat({ currentUser, students, onBackToSite }: CommunityChatProps) {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'general', name: 'General Discussion', locked: false },
    { id: 'batch', name: 'Batch Discussion', locked: false },
    { id: 'cr-notice', name: 'CR Notice', locked: false },
    { id: 'plant-discussion', name: 'Plant Discussion', locked: false },
    { id: 'research-help', name: 'Research Help', locked: false },
    { id: 'events', name: 'Events', locked: false },
    { id: 'field-visit', name: 'Field Visit', locked: false },
    { id: 'laboratory', name: 'Laboratory', locked: false },
    { id: 'herbarium', name: 'Herbarium', locked: false }
  ]);

  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<any | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  // Real-time typing users
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Admin feature states
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const isAdmin = currentUser?.role === 'super_admin';
  const isGuest = !currentUser;
  const isMuted = currentUser ? mutedUsers.includes(currentUser.id) : false;

  // 1. Sync Channels from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chat_channels'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default channels
        channels.forEach(async (c) => {
          await setDoc(doc(db, 'chat_channels', c.id), c);
        });
      } else {
        const loadedChannels: Channel[] = [];
        snapshot.forEach(docSnap => {
          loadedChannels.push(docSnap.data() as Channel);
        });
        setChannels(loadedChannels);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Sync Muted Users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'muted_users'), (snapshot) => {
      const muted: string[] = [];
      snapshot.forEach(docSnap => {
        muted.push(docSnap.id);
      });
      setMutedUsers(muted);
    });

    return () => unsubscribe();
  }, []);

  // 3. Sync Messages for Active Channel
  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('timestamp', 'asc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: any[] = [];
      snapshot.forEach((docSnap) => {
        const msg = { id: docSnap.id, ...docSnap.data() };
        loadedMessages.push(msg);
      });
      setMessages(loadedMessages);
    }, (error) => {
      console.error("Error fetching messages: ", error);
    });

    return () => unsubscribe();
  }, []);

  // 4. Sync Typing indicators in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chat_typing'), (snapshot) => {
      const typists: string[] = [];
      const now = Date.now();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Only include if typing on the active channel and not expired (older than 4 seconds)
        if (
          data.channelId === activeChannelId && 
          data.userId !== currentUser?.id &&
          now - data.timestamp < 4000
        ) {
          typists.push(data.userName);
        }
      });
      setTypingUsers(typists);
    });

    return () => unsubscribe();
  }, [activeChannelId, currentUser]);

  // Scroll to bottom on message load or channel change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, activeChannelId]);

  // Handle typing indicator updates
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (isGuest || isMuted) return;

    // Send typing state to Firestore
    if (currentUser) {
      setDoc(doc(db, 'chat_typing', currentUser.id), {
        userId: currentUser.id,
        userName: currentUser.name,
        channelId: activeChannelId,
        timestamp: Date.now()
      });

      // Clear after timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        deleteDoc(doc(db, 'chat_typing', currentUser.id));
      }, 3000);
    }
  };

  // Image upload handling with client-side canvas compression to keep Base64 size tiny (max 400x400)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setAttachedImage(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setAttachedImage(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    if (isMuted) return;
    if (activeChannel.locked && !isAdmin) return;
    if (!inputText.trim() && !attachedImage) return;

    try {
      if (editingMessageId) {
        // Edit flow
        await updateDoc(doc(db, 'chat_messages', editingMessageId), {
          message: inputText,
          edited: true
        });
        setEditingMessageId(null);
      } else {
        // Add message flow
        const newMsg: any = {
          channelId: activeChannelId,
          senderId: currentUser?.id || 'guest',
          senderName: currentUser?.name || 'Guest User',
          senderRoll: currentUser?.rollNumber || 'GUEST',
          senderPhoto: currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          message: inputText,
          timestamp: Date.now(),
          imageUrl: attachedImage || null,
          seenBy: [currentUser?.name || 'Anonymous']
        };

        if (replyToMessage) {
          newMsg.replyTo = {
            messageId: replyToMessage.id,
            senderName: replyToMessage.senderName,
            text: replyToMessage.message || '[Image Attached]'
          };
        }

        await addDoc(collection(db, 'chat_messages'), newMsg);
      }

      // Cleanup
      setInputText('');
      setAttachedImage(null);
      setReplyToMessage(null);
      setShowEmojiPicker(false);

      if (currentUser) {
        deleteDoc(doc(db, 'chat_typing', currentUser.id));
      }
    } catch (error) {
      console.error("Error writing message: ", error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'chat_messages', msgId));
    } catch (err) {
      console.error("Error deleting: ", err);
    }
  };

  // Pin message
  const handleTogglePinMessage = async (msg: any) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'chat_messages', msg.id), {
        pinned: !msg.pinned
      });
    } catch (err) {
      console.error("Error pinning: ", err);
    }
  };

  // Create Channel (Admin feature)
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newChannelName.trim()) return;

    const formattedId = newChannelName.toLowerCase().replace(/\s+/g, '-');
    const newChan: Channel = {
      id: formattedId,
      name: newChannelName.trim(),
      locked: false
    };

    try {
      await setDoc(doc(db, 'chat_channels', formattedId), newChan);
      setNewChannelName('');
      setShowChannelModal(false);
      setActiveChannelId(formattedId);
    } catch (err) {
      console.error("Error creating channel:", err);
    }
  };

  // Lock discussion (Admin Feature)
  const handleToggleChannelLock = async () => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'chat_channels', activeChannelId), {
        locked: !activeChannel.locked
      });
    } catch (err) {
      console.error("Error updating channel status: ", err);
    }
  };

  // Mute/Unmute user (Admin feature)
  const handleToggleMuteUser = async (userId: string) => {
    if (!isAdmin) return;
    try {
      if (mutedUsers.includes(userId)) {
        await deleteDoc(doc(db, 'muted_users', userId));
      } else {
        await setDoc(doc(db, 'muted_users', userId), {
          mutedAt: Date.now(),
          mutedBy: currentUser?.name || 'Admin'
        });
      }
    } catch (err) {
      console.error("Error muting: ", err);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  // Filter messages for current active channel and search query
  const filteredMessages = messages
    .filter(m => m.channelId === activeChannelId)
    .filter(m => {
      if (!searchQuery) return true;
      return m.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             m.senderName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const pinnedMessages = messages.filter(m => m.channelId === activeChannelId && m.pinned);

  // Online / simulated active members (from student list)
  const onlineMembers = students.filter(s => s.status !== 'Inactive').slice(0, 7);

  return (
    <div className="w-full h-screen flex flex-col bg-[#0A0A0A] text-[#F5F2EE] overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* Top Main Navigation Bar */}
      <header className="h-16 px-6 bg-[#0E0E0E] border-b border-[#C79A6B]/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToSite}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C79A6B] hover:text-[#F5F2EE] transition-all cursor-pointer group"
          >
            <LogOut className="w-4 h-4 text-[#C79A6B] group-hover:-translate-x-1 transition-transform" />
            <span>Exit Community</span>
          </button>
          <div className="h-4 w-[1px] bg-[#C79A6B]/30" />
          <div className="flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase">
              Botany Nexus DGC
            </span>
          </div>
        </div>

        {/* Current User details */}
        <div className="flex items-center gap-3">
          {isGuest ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-500 font-mono font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>GUEST READ-ONLY MODE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111111] border border-[#C79A6B]/20 rounded">
              <img 
                src={currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
                alt="Me" 
                className="w-5 h-5 rounded-full object-cover border border-[#C79A6B]/35" 
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-medium text-[#F5F2EE] leading-none">
                  {currentUser?.name}
                </span>
                <span className={`text-[8px] font-mono leading-none mt-0.5 ${isAdmin ? 'text-amber-400 font-bold' : 'text-[#C79A6B]'}`}>
                  {isAdmin ? 'CURATOR ADMIN' : `Roll: ${currentUser?.rollNumber}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Channels */}
        <aside className="w-64 bg-[#0E0E0E] border-r border-[#C79A6B]/15 flex flex-col justify-between hidden md:flex flex-shrink-0">
          <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
            <div className="flex items-center justify-between text-left pb-2 border-b border-[#C79A6B]/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C79A6B]" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#C79A6B] uppercase font-bold">
                  CHANNELS
                </span>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setShowChannelModal(true)}
                  title="Create Channel"
                  className="p-1 hover:bg-[#1A1A1A] border border-[#C79A6B]/20 hover:border-[#C79A6B] rounded transition-all cursor-pointer text-[#C79A6B]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <nav className="space-y-1.5">
              {channels.map((chan) => {
                const isActive = chan.id === activeChannelId;
                return (
                  <button
                    key={chan.id}
                    onClick={() => {
                      setActiveChannelId(chan.id);
                      setEditingMessageId(null);
                      setReplyToMessage(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-mono text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#C79A6B]/10 border-l-2 border-[#C79A6B] text-[#C79A6B] font-bold' 
                        : 'text-[#F5F2EE]/60 hover:bg-[#111111] hover:text-[#C79A6B]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className={`w-3.5 h-3.5 ${isActive ? 'text-[#C79A6B]' : 'text-[#F5F2EE]/30'}`} />
                      <span className="truncate">{chan.name}</span>
                    </div>
                    {chan.locked && (
                      <Lock className="w-3 h-3 text-amber-500/70" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats or Footer inside Sidebar */}
          <div className="p-4 bg-[#0A0A0A] border-t border-[#C79A6B]/15 text-left space-y-2 select-none">
            <p className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider">
              STUDENT COMMUNITY PORTAL
            </p>
            <p className="text-[10px] text-[#F5F2EE]/45 font-light">
              Active discussion ensures collaborative learning and specimen collection indexing.
            </p>
          </div>
        </aside>

        {/* CENTER AREA: Chat logs & Input */}
        <main className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden relative">
          
          {/* Top channel header bar */}
          <div className="h-14 px-6 bg-[#0D0D0D] border-b border-[#C79A6B]/15 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-[#C79A6B]" />
              <div className="text-left">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  {activeChannel.name}
                </h3>
                <span className="text-[9px] font-mono text-emerald-500/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineMembers.length + 3} users online
                </span>
              </div>
              {activeChannel.locked && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[8px] font-mono uppercase text-amber-500">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked</span>
                </div>
              )}
            </div>

            {/* Search messages bar */}
            <div className="relative max-w-xs w-full hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-3 h-3 text-[#C79A6B]/60" />
              </span>
              <input
                type="text"
                placeholder="Search channel messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#C79A6B]/20 rounded-xs pl-8 pr-4 py-1.5 text-[10px] text-[#F5F2EE] placeholder-gray-500 outline-none focus:border-[#C79A6B]/60 transition-all font-mono"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#C79A6B] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Messages scroll box */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <MessageSquare className="w-12 h-12 text-[#C79A6B] mb-3 animate-bounce" />
                <p className="text-xs font-mono text-[#8F6A48] uppercase tracking-widest">
                  No messages found
                </p>
                <p className="text-[10px] text-[#F5F2EE]/50 mt-1 max-w-xs leading-relaxed">
                  {searchQuery 
                    ? "Try adjusting your search query, or verify spellings."
                    : `Welcome to the start of the #${activeChannel.id} channel! Drop a greeting or share research findings.`
                  }
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.id;
                const isMsgMuted = mutedUsers.includes(msg.senderId);
                
                return (
                  <div key={msg.id} className="group flex flex-col text-left space-y-1 relative">
                    {/* Reply to render above */}
                    {msg.replyTo && (
                      <div className="flex items-center gap-2 text-[9px] text-[#C79A6B]/75 font-mono ml-11 pl-2 border-l-2 border-[#C79A6B]/20 mb-0.5">
                        <CornerUpLeft className="w-3 h-3 text-[#C79A6B]/50" />
                        <span className="font-bold">{msg.replyTo.senderName}</span>
                        <span className="text-[#F5F2EE]/50 truncate max-w-[200px]">
                          : {msg.replyTo.text}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3 items-start">
                      <div className="relative">
                        <img
                          src={msg.senderPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={msg.senderName}
                          className="w-9 h-9 rounded-full object-cover border border-[#C79A6B]/20 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        {/* Simulated green dot if online */}
                        {students.some(s => s.id === msg.senderId && s.status !== 'Inactive') && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0A0A]" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-[11px] font-mono font-bold text-[#C79A6B] hover:underline cursor-pointer">
                            {msg.senderName}
                          </span>
                          <span className="text-[8px] font-mono text-[#8F6A48] uppercase">
                            Roll: {msg.senderRoll}
                          </span>
                          <span className="text-[8px] font-mono text-[#F5F2EE]/40">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.edited && (
                            <span className="text-[8px] font-mono text-gray-500 italic">
                              (edited)
                            </span>
                          )}
                          {msg.pinned && (
                            <span className="text-[8px] font-mono text-amber-500/90 flex items-center gap-1 bg-amber-500/10 px-1 border border-amber-500/30 rounded">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>

                        {/* Message payload */}
                        <div className="p-2.5 bg-[#111111]/90 hover:bg-[#151515] border border-[#C79A6B]/10 rounded-xs text-xs text-[#F5F2EE]/90 leading-relaxed max-w-2xl">
                          {isMsgMuted ? (
                            <p className="text-[10px] font-mono text-red-500 italic">
                              [This message has been hidden because the user is muted by Admin]
                            </p>
                          ) : (
                            <>
                              <p className="whitespace-pre-wrap">{msg.message}</p>
                              {msg.imageUrl && (
                                <div className="mt-2.5 max-w-sm rounded overflow-hidden border border-[#C79A6B]/20 bg-[#0A0A0A]">
                                  <img 
                                    src={msg.imageUrl} 
                                    alt="User Attached specimen illustration" 
                                    className="w-full object-contain max-h-60" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Seen marker list */}
                        <div className="flex items-center gap-1.5 ml-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500/80" />
                          <span className="text-[8px] font-mono text-gray-500">
                            Seen by {msg.seenBy?.join(', ') || 'Class peers'}
                          </span>
                        </div>
                      </div>

                      {/* Floating actions menu on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-2 bg-[#161616] border border-[#C79A6B]/30 rounded p-1 flex items-center gap-1 z-10 shadow-lg">
                        {!isGuest && !isMuted && !activeChannel.locked && (
                          <button
                            onClick={() => setReplyToMessage(msg)}
                            title="Reply to Message"
                            className="p-1 hover:bg-[#252525] rounded text-[#C79A6B] cursor-pointer"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isOwn && !isGuest && (
                          <button
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setInputText(msg.message);
                            }}
                            title="Edit Message"
                            className="p-1 hover:bg-[#252525] rounded text-emerald-400 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(isOwn || isAdmin) && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete Message"
                            className="p-1 hover:bg-[#252525] rounded text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleTogglePinMessage(msg)}
                              title={msg.pinned ? "Unpin Message" : "Pin Message"}
                              className={`p-1 hover:bg-[#252525] rounded cursor-pointer ${msg.pinned ? 'text-amber-400' : 'text-gray-400'}`}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleMuteUser(msg.senderId)}
                              title={mutedUsers.includes(msg.senderId) ? "Unmute User" : "Mute User"}
                              className="p-1 hover:bg-[#252525] rounded text-red-500 font-mono text-[9px] px-1 font-bold cursor-pointer"
                            >
                              {mutedUsers.includes(msg.senderId) ? 'Unmute' : 'Mute'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply and Attachment Preview banners above Input */}
          <div className="px-6 space-y-2">
            {replyToMessage && (
              <div className="p-2.5 bg-[#1A1A1A] border-l-2 border-[#C79A6B] flex items-center justify-between rounded-xs text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <CornerUpLeft className="w-3.5 h-3.5 text-[#C79A6B]" />
                  <span>Replying to <span className="text-[#C79A6B] font-bold">{replyToMessage.senderName}</span>: <span className="text-gray-400 truncate max-w-sm">{replyToMessage.message || '[Image]'}</span></span>
                </div>
                <button onClick={() => setReplyToMessage(null)} className="p-1 hover:bg-[#252525] rounded">
                  <X className="w-3.5 h-3.5 text-[#C79A6B]" />
                </button>
              </div>
            )}

            {attachedImage && (
              <div className="p-2.5 bg-[#1A1A1A] border border-dashed border-[#C79A6B]/30 flex items-center justify-between rounded-xs text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C79A6B] animate-pulse" />
                  <span>Image attached ({attachedImage.length > 50000 ? 'compressed JPG' : 'specimen thumbnail'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={attachedImage} className="w-8 h-8 object-cover rounded border border-[#C79A6B]/20" referrerPolicy="no-referrer" alt="preview" />
                  <button onClick={() => setAttachedImage(null)} className="p-1 hover:bg-[#252525] rounded">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="px-6 py-1.5 text-left text-[9px] font-mono text-[#C79A6B] select-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C79A6B] animate-ping" />
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}

          {/* Input Control Form Bar */}
          <div className="p-4 bg-[#0D0D0D] border-t border-[#C79A6B]/15 relative">
            
            {/* Quick Emojis Selection Row */}
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#C79A6B]/10 overflow-x-auto text-xs">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 text-[#C79A6B] hover:text-[#F5F2EE] font-mono flex items-center gap-1 border border-[#C79A6B]/20 rounded bg-[#111111] cursor-pointer text-[10px]"
              >
                <Smile className="w-3 h-3" />
                <span>Quick Emojis</span>
              </button>
              {['🌿', '💬', '🔬', '🎓', '👍', '❤️', '😂', '🎉', '😮', '❓', '🌸', '🌲', '📚'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-1 hover:bg-[#1A1A1A] rounded transition-colors text-sm cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSendMessage} className="flex gap-3 items-stretch">
              {/* Image attachment hidden trigger */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                disabled={isGuest || isMuted}
                onClick={() => fileInputRef.current?.click()}
                title="Attach Herbarium Specimen Image"
                className="p-3 bg-[#111111] hover:bg-[#1D1D1D] disabled:opacity-40 border border-[#C79A6B]/30 rounded-xs text-[#C79A6B] flex items-center justify-center transition-all cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={
                  isGuest 
                    ? "Guest mode is read-only. Please log in to participate." 
                    : isMuted 
                      ? "You are currently muted by curator admin."
                      : activeChannel.locked && !isAdmin
                        ? "This discussion thread is locked by Admin."
                        : `Message #${activeChannel.id}...`
                }
                value={inputText}
                onChange={handleInputChange}
                disabled={isGuest || isMuted || (activeChannel.locked && !isAdmin)}
                className="flex-1 bg-[#111111] border border-[#C79A6B]/20 rounded-xs px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#C79A6B]/60 outline-none transition-all"
              />

              <button
                type="submit"
                disabled={isGuest || isMuted || (activeChannel.locked && !isAdmin) || (!inputText.trim() && !attachedImage)}
                className="px-5 bg-[#C79A6B] disabled:bg-gray-800 disabled:text-gray-500 disabled:border-transparent text-black text-xs font-mono uppercase font-bold rounded-xs flex items-center gap-2 cursor-pointer hover:bg-[#b08456] transition-all"
              >
                <span>{editingMessageId ? 'Update' : 'Send'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Metadata panel */}
        <aside className="w-72 bg-[#0E0E0E] border-l border-[#C79A6B]/15 flex flex-col justify-between hidden lg:flex flex-shrink-0">
          <div className="flex-1 overflow-y-auto py-5 px-5 space-y-6">
            
            {/* Active Members section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#C79A6B]/10">
                <Users className="w-4 h-4 text-[#C79A6B]" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#C79A6B] uppercase font-bold">
                  ACTIVE MEMBERS
                </span>
              </div>
              <div className="space-y-2.5 text-left">
                {onlineMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img 
                          src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
                          alt={member.name} 
                          className="w-6 h-6 rounded-full object-cover border border-[#C79A6B]/20"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#0E0E0E]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-white hover:underline cursor-pointer">
                          {member.name}
                        </p>
                        <p className="text-[8px] font-mono text-[#8F6A48] leading-none uppercase">
                          {member.role === 'CR' ? 'Class Representative' : 'Student Curator'}
                        </p>
                      </div>
                    </div>
                    {isAdmin && member.id !== currentUser?.id && (
                      <button 
                        onClick={() => handleToggleMuteUser(member.id)}
                        className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                          mutedUsers.includes(member.id)
                            ? 'bg-red-500/15 border-red-500/30 text-red-400'
                            : 'bg-transparent border-gray-800 text-gray-400 hover:border-red-500/40 hover:text-red-400'
                        }`}
                      >
                        {mutedUsers.includes(member.id) ? 'Muted' : 'Mute'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned Messages inside Current Channel */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#C79A6B]/10">
                <Pin className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-amber-500 uppercase font-bold">
                  PINNED MESSAGES
                </span>
              </div>
              <div className="space-y-2 text-left">
                {pinnedMessages.length === 0 ? (
                  <p className="text-[10px] text-[#F5F2EE]/40 italic">
                    No pinned messages in this channel.
                  </p>
                ) : (
                  pinnedMessages.map((pMsg) => (
                    <div key={pMsg.id} className="p-2.5 bg-[#121212] border border-amber-500/20 rounded-xs text-[10px] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-[9px]">{pMsg.senderName}</span>
                        {isAdmin && (
                          <button 
                            onClick={() => handleTogglePinMessage(pMsg)}
                            className="text-[9px] text-red-400 hover:underline cursor-pointer"
                          >
                            Unpin
                          </button>
                        )}
                      </div>
                      <p className="text-[#F5F2EE]/80 line-clamp-3 leading-relaxed">{pMsg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events sidebar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#C79A6B]/10">
                <Calendar className="w-4 h-4 text-[#C79A6B]" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#C79A6B] uppercase font-bold">
                  UPCOMING EVENTS
                </span>
              </div>
              <div className="space-y-2.5 text-left">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.id} className="p-2 bg-[#111111]/40 border border-[#C79A6B]/10 rounded-xs">
                    <span className="text-[8px] font-mono text-[#8F6A48] uppercase tracking-widest block mb-0.5">
                      {event.date}
                    </span>
                    <h5 className="text-[11px] font-medium text-white line-clamp-1">
                      {event.title}
                    </h5>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel for Admin */}
            {isAdmin && (
              <div className="space-y-3 pt-4 border-t border-[#C79A6B]/15">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[9px] font-mono tracking-wider text-amber-500 font-bold uppercase">
                    Curator Controls
                  </span>
                </div>
                <button
                  onClick={handleToggleChannelLock}
                  className={`w-full py-1.5 px-3 rounded text-[10px] font-mono uppercase tracking-widest border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeChannel.locked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                  }`}
                >
                  {activeChannel.locked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock discussion</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock discussion</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* CREATE CHANNEL MODAL */}
      <AnimatePresence>
        {showChannelModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-[#C79A6B]/30 max-w-sm w-full p-6 space-y-4 rounded-xs text-left"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#C79A6B]/15">
                <h4 className="font-serif text-base text-white">Create Discussion Channel</h4>
                <button 
                  onClick={() => setShowChannelModal(false)}
                  className="p-1 hover:bg-[#1A1A1A] rounded"
                >
                  <X className="w-4 h-4 text-[#C79A6B]" />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. lab-experiments"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#C79A6B]/20 rounded-xs px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-[#C79A6B]/60 outline-none transition-all font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChannelModal(false)}
                    className="px-4 py-2 border border-[#C79A6B]/20 hover:border-[#C79A6B] text-[10px] text-[#C79A6B] font-mono uppercase rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#C79A6B] hover:bg-[#b08456] text-black text-[10px] font-mono uppercase font-bold rounded transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
