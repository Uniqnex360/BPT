// import { useState } from 'react';
// import { CheckCircle, AlertCircle } from 'lucide-react';
// import { supabase } from '../lib/supabase';

// type Props = {
//   dark?: boolean;
// };

// export default function SubscribeInline({ dark = false }: Props) {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState('');

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError('');
//     if (!email.trim()) { setError('Email is required.'); return; }
//     setSubmitting(true);
//     const { error: err } = await supabase.from('subscribers').insert({
//       email: email.trim().toLowerCase(),
//       name: name.trim(),
//     });
//     setSubmitting(false);
//     if (err) {
//       setError(err.code === '23505' ? "You're already subscribed!" : 'Something went wrong.');
//       return;
//     }
//     setSubmitted(true);
//   }

//   const inputClass = dark
//     ? 'w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400'
//     : 'w-full px-3 py-2.5 bg-white border border-pink-200 text-gray-800 placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300';

//   if (submitted) {
//     return (
//       <div className="flex items-center gap-2 text-green-400 text-sm py-1">
//         <CheckCircle size={16} className="flex-shrink-0" />
//         <span>You're subscribed!</span>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-2">
//       {error && (
//         <div className="flex items-center gap-1.5 text-xs text-red-400">
//           <AlertCircle size={13} />{error}
//         </div>
//       )}
//       <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First name" className={inputClass} />
//       <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className={inputClass} />
//       <button
//         type="submit"
//         disabled={submitting}
//         className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60"
//       >
//         {submitting ? 'Joining...' : 'Subscribe Free'}
//       </button>
//       <p className="text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
//     </form>
//   );
// }

import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type SendSubscribeEmailParams = {
  name: string;
  email: string;
};

// Changed ONLY this function: EmailJS -> Web3Forms
export async function sendSubscribeEmail({
  name,
  email,
}: SendSubscribeEmailParams) {
  return fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_key: import.meta.env.VITE_WEB3FORMS_KEY,
      subject: "🚀 New User Subscription",
      name,
      email,
      message: `
Name: ${name}
Email: ${email}
      `,
    }),
  });
}

type Props = {
  dark?: boolean;
};

export default function SubscribeInline({ dark = false }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);

    const { error: err } = await supabase.from("subscribers").insert({
      email: email.trim().toLowerCase(),
      name: name.trim(),
    });

    // Existing logic unchanged
    await sendSubscribeEmail({ name, email });

    setSubmitting(false);

    if (err) {
      setError(
        err.code === "23505"
          ? "You're already subscribed!"
          : "Something went wrong.",
      );
      return;
    }

    setSubmitted(true);
  }

  const inputClass = dark
    ? "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
    : "w-full px-3 py-2.5 bg-white border border-pink-200 text-gray-800 placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300";

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm py-1">
        <CheckCircle size={16} className="flex-shrink-0" />
        <span>You're subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name"
        className={inputClass}
      />

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className={inputClass}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60"
      >
        {submitting ? "Joining..." : "Subscribe Free"}
      </button>

      <p className="text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
