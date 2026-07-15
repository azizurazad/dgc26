const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Firestore OnCreate Trigger to dispatch actual Firebase Cloud Messaging (FCM)
 * push notifications whenever an admin registers a new alert in Firestore.
 */
exports.sendFcmOnNotificationCreate = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    const notif = snapshot.data();
    if (!notif) {
      console.log("No data found in the notification snapshot.");
      return null;
    }

    const {
      id,
      title,
      message,
      category,
      imageUrl,
      targetAudience,
      targetBatch,
      targetStudents,
      priority,
      deepLinkUrl,
      noticeId
    } = notif;

    console.log(`Processing notification trigger for: ${title} (${targetAudience})`);

    const db = admin.firestore();
    let query = db.collection("students");

    try {
      // If targeting a specific batch, pre-filter via firestore query index
      if (targetAudience === "Selected Batch" && targetBatch) {
        query = query.where("batch", "==", targetBatch);
      }

      const studentsSnapshot = await query.get();
      const targetTokens = [];

      studentsSnapshot.forEach((doc) => {
        const student = doc.data();
        const studentId = doc.id;

        // If targeting specific students list, verify presence
        if (targetAudience === "Selected Students") {
          if (!targetStudents || !targetStudents.includes(studentId)) {
            return; 
          }
        }

        // Extract active registration tokens
        const token = student.notificationToken || student.fcmToken;
        const enabled = student.notificationEnabled !== false && student.fcmTokenStatus !== "blocked";

        if (token && enabled) {
          if (!targetTokens.includes(token)) {
            targetTokens.push(token);
          }
        }
      });

      // Filter out sandbox/mock preview tokens
      const realTokens = targetTokens.filter(t => t && !t.startsWith("fcm-preview-"));

      if (realTokens.length === 0) {
        console.log("No active real FCM registration tokens found. Skipping push notification dispatch.");
        return null;
      }

      console.log(`Resolved ${realTokens.length} active recipient token(s). Compiling FCM multicast payload...`);

      // Determine click action redirection link path
      let finalLink = deepLinkUrl || "";
      if (!finalLink) {
        const refId = noticeId || id;
        if (category === "Event") {
          finalLink = `/events/${refId}`;
        } else {
          finalLink = `/notifications/${refId}`;
        }
      }

      // Build structured Multicast payload meeting exact payload specifications
      const payload = {
        tokens: realTokens,
        notification: {
          title: title,
          body: message,
          image: imageUrl || undefined
        },
        data: {
          title: title,
          body: message,
          image: imageUrl || "",
          click_action: finalLink,
          link: finalLink,
          category: category,
          notificationId: id,
          timestamp: String(Date.now()),
          noticeId: noticeId || id
        },
        webpush: {
          notification: {
            title: title,
            body: message,
            icon: "/logo.svg",
            badge: "/favicon-16x16.png",
            image: imageUrl || undefined,
            data: {
              click_action: finalLink,
              link: finalLink
            }
          },
          fcmOptions: {
            link: finalLink
          }
        },
        android: {
          priority: priority === "High" || priority === "Emergency" ? "high" : "normal",
          notification: {
            title: title,
            body: message,
            icon: "stock_ticker_update",
            color: "#C79A6B",
            sound: "default",
            clickAction: finalLink
          }
        }
      };

      // Broadcast multicast messages using Firebase Admin SDK
      const response = await admin.messaging().sendEachForMulticast(payload);
      console.log(`FCM Broadcast complete: ${response.successCount} successfully sent, ${response.failureCount} failed.`);

      // Clean up stale, invalid, or expired tokens from the students collection
      if (response.failureCount > 0) {
        const staleTokens = [];
        response.responses.forEach((resp, index) => {
          if (!resp.success) {
            const err = resp.error;
            if (err && (
              err.code === "messaging/invalid-registration-token" ||
              err.code === "messaging/registration-token-not-registered"
            )) {
              staleTokens.push(realTokens[index]);
            }
          }
        });

        if (staleTokens.length > 0) {
          console.log(`De-registering ${staleTokens.length} expired registration token(s) from database...`);
          const batch = db.batch();
          
          // Chunk query in batches of 10 (FCM limits lists) or process safely
          for (const tokenToClean of staleTokens) {
            const studentsWithBadToken = await db.collection("students")
              .where("fcmToken", "==", tokenToClean)
              .get();

            studentsWithBadToken.forEach((sDoc) => {
              batch.update(sDoc.ref, {
                fcmToken: "",
                notificationToken: "",
                fcmTokenStatus: "expired"
              });
            });
            
            const studentsWithBadNotifToken = await db.collection("students")
              .where("notificationToken", "==", tokenToClean)
              .get();

            studentsWithBadNotifToken.forEach((sDoc) => {
              batch.update(sDoc.ref, {
                fcmToken: "",
                notificationToken: "",
                fcmTokenStatus: "expired"
              });
            });
          }

          await batch.commit();
          console.log("Firestore database token sanitization completed.");
        }
      }

      return { success: true, count: response.successCount };
    } catch (err) {
      console.error("FCM Broadcaster Cloud Function encountered a critical runtime exception:", err);
      throw err;
    }
  });
