import cron from "node-cron";
import { db } from "../libs/db.js";

const deleteUnverifiedUsers = async () => {
  try {
    const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);

    // Delete users who are not verified and their verificationTokenExpiry is older than 40 minutes
    const result = await db.user.deleteMany({
      where: {
        isVerified: false,
        verificationTokenExpiry: {
          lt: fortyMinutesAgo,
        },
      },
    });

    console.log(`${result.count} unverified users deleted.`);
  } catch (error) {
    console.error("Error deleting unverified users:", error.message);
  }
};

// Schedule the task to run every 10 minutes
cron.schedule("*/10 * * * *", deleteUnverifiedUsers);

export default deleteUnverifiedUsers;