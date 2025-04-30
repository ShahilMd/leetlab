-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refreshToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resetPasswordToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resetPasswordTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3);
