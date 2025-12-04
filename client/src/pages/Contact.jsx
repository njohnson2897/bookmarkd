import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SUBMIT_CONTACT } from "../utils/mutations.js";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitContactMutation, { loading, error }] = useMutation(SUBMIT_CONTACT);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);

    try {
      await submitContactMutation({
        variables: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact form:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-primary2 mb-4 text-center">
          Contact Us
        </h1>
        
        <div className="mb-6 text-center text-gray-700">
          <p className="mb-2">
            We'd love to hear from you! Whether you have a question, feedback, 
            or just want to say hello, feel free to reach out.
          </p>
          <p>
            We'll get back to you as soon as possible.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-800 font-semibold text-lg mb-2">
              ✓ Thank you for your message!
            </p>
            <p className="text-green-700">
              We've received your message and will get back to you soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error.message || "Error submitting message. Please try again."}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block font-semibold text-primary2 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-semibold text-primary2 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block font-semibold text-primary2 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary1 text-white px-6 py-3 rounded hover:bg-accent transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;

