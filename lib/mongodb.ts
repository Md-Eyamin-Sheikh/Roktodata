import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailureTime: number;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || (global.mongooseCache = {
  conn: null,
  promise: null,
  lastFailureTime: 0,
});

// Cooldown period before attempting to reconnect to Atlas after an IP whitelist / network failure
const RETRY_COOLDOWN_MS = 60000; // 60 seconds

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI || MONGODB_URI.includes('username:password') || MONGODB_URI.includes('YOUR_')) {
    return null;
  }

  // If already connected and connection is ready, return it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Fast Circuit Breaker: If connection recently timed out (e.g. Atlas IP Whitelist 0.0.0.0/0 not added),
  // return null immediately in 0ms so the user experiences zero lag.
  const now = Date.now();
  if (now - cached.lastFailureTime < RETRY_COOLDOWN_MS) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 2500, // Fast 2.5s timeout instead of stalling for long
      connectTimeoutMS: 2500,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('✅ [MongoDB Atlas] সফলভাবে ক্লাউড ডেটাবেজে সংযুক্ত হয়েছে');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    cached.lastFailureTime = Date.now();

    const isWhitelistError =
      error?.name === 'MongooseServerSelectionError' ||
      error?.message?.includes('whitelisted') ||
      error?.message?.includes('Could not connect to any servers');

    if (isWhitelistError) {
      console.warn(
        'ℹ️ [MongoDB Atlas Notice]: Atlas ক্লাস্টারে সংযোগ করা সম্ভব হয়নি। সমাধান: MongoDB Atlas ড্যাশবোর্ডে Network Access -> Add IP Address -> "0.0.0.0/0" (Allow Access from Anywhere) যুক্ত করুন। অ্যাপটি রেজিলিয়েন্ট ডেটাবেজে কোনো ল্যাগ ছাড়াই চলছে।'
      );
    } else {
      console.warn('⚠️ [MongoDB Atlas]:', error?.message || error);
    }

    return null;
  }
}

export default connectToDatabase;
