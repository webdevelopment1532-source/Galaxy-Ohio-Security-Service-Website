import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
}

export default function Testimonial({ quote, author }: TestimonialProps) {
  return (
    <blockquote style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
      "{quote}" <br />
      <span style={{ color: '#ffe600' }}>— {author}</span>
    </blockquote>
  );
}
