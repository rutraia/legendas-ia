import React from 'react';

interface TestimonialProps {
  name: string;
  role: string;
  company?: string;
  testimonial: string;
  rating?: number;
  image?: string;
}

export const TestimonialCard: React.FC<TestimonialProps> = ({ name, role, company, testimonial, rating = 5, image }) => (
  <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-primary/20">
    {image && (
      <img src={image} alt={name} className="w-16 h-16 rounded-full mb-4 border-2 border-primary object-cover" />
    )}
    <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
    <p className="text-primary text-sm mb-1">{role}{company && `, ${company}`}</p>
    <div className="flex items-center justify-center mb-2">
      {Array.from({ length: rating }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.386-2.46a1 1 0 00-1.175 0l-3.386 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"/></svg>
      ))}
    </div>
    <p className="text-gray-300 text-base mb-2">"{testimonial}"</p>
  </div>
);
