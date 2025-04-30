-- AlterTable
ALTER TABLE "User" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "refreshToken" DROP DEFAULT,
ALTER COLUMN "resetPasswordToken" DROP NOT NULL,
ALTER COLUMN "resetPasswordToken" DROP DEFAULT,
ALTER COLUMN "verificationToken" DROP NOT NULL,
ALTER COLUMN "verificationToken" DROP DEFAULT;
