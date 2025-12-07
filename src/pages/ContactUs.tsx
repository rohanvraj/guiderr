import React from 'react';

export default function ContactUs() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="mb-4 text-center text-gray-700">
        Have questions or need help? Reach out to us using the form below or email us directly at{' '}
        <a href="mailto:hello@guiderr.com" className="text-blue-600 underline">hello@guiderr.com</a>.
      </p>

      <form className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" className="w-full border rounded px-3 py-2" placeholder="Your Name" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" placeholder="Your Email" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Message</label>
          <textarea className="w-full border rounded px-3 py-2" placeholder="Your Message" rows={4}></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>
    </div>
  );
}
