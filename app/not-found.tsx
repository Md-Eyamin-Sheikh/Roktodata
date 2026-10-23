import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-extrabold text-2xl mb-4 shadow-xs">
        ৪০৪
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1B1B1F] mb-2">
        পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
      </h1>
      <p className="text-sm text-[#5B5F6B] max-w-md mb-6 leading-relaxed">
        আপনি যে রক্তের অনুরোধ বা পেজটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা লিংকটি ভুল।
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-sm shadow-xs transition-colors"
      >
        মূল পাতায় ফিরে যান
      </Link>
    </div>
  );
}
