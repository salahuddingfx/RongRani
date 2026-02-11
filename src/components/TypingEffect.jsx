import React, { useState, useEffect } from 'react';

const TypingEffect = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((currentIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : (displayText.length === currentText.length ? pauseTime : speed));

    return () => clearTimeout(timer);
  }, [displayText, currentIndex, isDeleting, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      <span className="w-1 md:w-1.5 h-8 md:h-12 bg-maroon ml-1 animate-pulse rounded-full" />
    </span>
  );
};

export default TypingEffect;
