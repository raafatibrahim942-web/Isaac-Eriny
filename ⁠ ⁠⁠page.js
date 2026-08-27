"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

export default function WeddingPage() {
  const weddingDate = new Date("2026-10-15T20:00:00").getTime();
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = weddingDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessagesList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!guestName || !message) return;
    await addDoc(collection(db, "wishes"), {
      name: guestName,
      message: message,
      createdAt: new Date(),
    });
    setGuestName("");
    setMessage("");
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("https://api.imgbb.com/1/upload?key=243ec99e7560776fa893d5a2dc2faf20", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const imageUrl = data.data.url;

      await addDoc(collection(db, "photos"), {
        url: imageUrl,
        createdAt: new Date(),
      });

      setFile(null);
      alert("تم رفع الصورة بنجاح! شكراً لمشاركتنا الفرحة ❤️");
    } catch (err) {
      alert("حدث خطأ أثناء رفع الصورة، برجاء المحاولة لاحقاً.");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-rose-50 text-gray-800 dir-rtl font-sans pb-12">
      <section className="text-center py-10 px-4 bg-white shadow-sm border-b">
        <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-6 rounded-full overflow-hidden border-4 border-rose-400 shadow-lg">
          <img 
            src="/couple.jpg" 
            alt="Isaac & Eriny" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-rose-600 mb-2">
          Isaac & Eriny
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 font-medium">
          يتشرفان بدعوتكم لمشاركتهم فرحة الإكليل والزفاف ⛪✨
        </p>
      </section>

      <section className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-md text-center border border-rose-100">
        <h2 className="text-xl font-bold mb-4 text-rose-500">الوقت المتبقي على الفرح ⏳</h2>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-rose-100 p-3 rounded-xl"><span className="text-2xl font-bold text-rose-700">{timeLeft.days}</span><br/><span className="text-sm">يوم</span></div>
          <div className="bg-rose-100 p-3 rounded-xl"><span className="text-2xl font-bold text-rose-700">{timeLeft.hours}</span><br/><span className="text-sm">ساعة</span></div>
          <div className="bg-rose-100 p-3 rounded-xl"><span className="text-2xl font-bold text-rose-700">{timeLeft.minutes}</span><br/><span className="text-sm">دقيقة</span></div>
          <div className="bg-rose-100 p-3 rounded-xl"><span className="text-2xl font-bold text-rose-700">{timeLeft.seconds}</span><br/><span className="text-sm">ثانية</span></div>
        </div>
      </section>

      <section className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-md text-center border border-rose-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📌 مواعيد وتفاصيل الفرح</h2>
        
        <div className="mb-6 p-4 bg-rose-50 rounded-xl text-right">
          <h3 className="font-bold text-rose-600 text-lg mb-1">⛪ صلاة الإكليل المقدس:</h3>
          <p className="text-gray-700 font-semibold">كنيسة الملاك والبابا كيرلس بملوي</p>
          <p className="text-gray-600">الساعة 8:00 مساءً 🕗</p>
        </div>

        <div className="mb-2 p-4 bg-rose-50 rounded-xl text-right">
          <h3 className="font-bold text-rose-600 text-lg mb-1">🎉 الحفل والقاعة:</h3>
          <p className="text-gray-700 font-semibold">قاعة رويال بملوي</p>
        </div>
      </section>

      <section className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-md border border-rose-100">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">✍️ اترك كلمة للعروسين</h2>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <input
            type="text"
            placeholder="إسمك"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
            required
          />
          <textarea
            placeholder="اكتب تهنئتك ومحبتك هنا..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 h-24"
            required
          ></textarea>
          <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition shadow">
            إرسال التهنئة ❤️
          </button>
        </form>

        <div className="mt-8 space-y-3 max-h-60 overflow-y-auto">
          {messagesList.map((item) => (
            <div key={item.id} className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <p className="font-bold text-rose-600">{item.name}</p>
              <p className="text-gray-700 text-sm mt-1">{item.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-md text-center border border-rose-100">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">📸 شاركنا صورك في الفرح</h2>
        <p className="text-sm text-gray-500 mb-4">ارفع الصور التي تذكرك باليوم ده معنا عشان نجمعها في ألبوم واحد</p>
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition disabled:bg-gray-400"
          >
            {uploading ? "جاري الرفع..." : "رفع الصورة 📤"}
          </button>
        </form>
      </section>
    </div>
  );
}
