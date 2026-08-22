"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/260777777079"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Afrilink on WhatsApp"
      className="fixed bottom-24 right-4 z-50 rounded-full bg-green-500 px-4 py-3 font-semibold text-white shadow-lg hover:bg-green-600 md:bottom-6 md:right-6 md:px-5"
    >
      <span aria-hidden="true">💬</span><span className="hidden md:inline"> WhatsApp</span>
    </a>
  );
}
