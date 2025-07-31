import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InsuranceCard } from './InsuranceCard';
import './CarouselSection.css';

export function CarouselSection({ title, subtitle, data, color, insuranceType }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || data.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % data.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, data.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? data.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % data.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const getVisibleCards = () => {
    if (data.length === 0) return [];

    const cards = [];
    const cardsToShow = window.innerWidth >= 768 ? Math.min(3, data.length) : 1;

    for (let i = 0; i < cardsToShow; i++) {
      const index = (currentIndex + i) % data.length;
      cards.push({ ...data[index], displayIndex: i });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  if (data.length === 0) {
    return (
      <div className="carousel-section">
        <div className="carousel-section__header">
          <h2 className="carousel-section__title">{title}</h2>
          <p className="carousel-section__subtitle">{subtitle}</p>
        </div>
        <div className="carousel-section__empty">
          <p className="carousel-section__empty-text">No insurance options available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-section">
      <div className="carousel-section__header">
        <h2 className="carousel-section__title">{title}</h2>
        <p className="carousel-section__subtitle">{subtitle}</p>
      </div>

      <div
        className="carousel-section__container"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {data.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="carousel-section__nav carousel-section__nav--left"
              aria-label="Previous insurance option"
            >
              <ChevronLeft className="carousel-section__nav-icon" />
            </button>

            <button
              onClick={goToNext}
              className="carousel-section__nav carousel-section__nav--right"
              aria-label="Next insurance option"
            >
              <ChevronRight className="carousel-section__nav-icon" />
            </button>
          </>
        )}

        <div className="carousel-section__cards-container">
          <div className="carousel-section__cards">
            {visibleCards.map((item, index) => (
              <div
                key={`${item.id}-${currentIndex}-${index}`}
                className="carousel-section__card"
              >
                <InsuranceCard
                  item={item}
                  color={color}
                  isCenter={index === 1 && visibleCards.length === 3}
                  insuranceType={insuranceType}
                />
              </div>
            ))}
          </div>
        </div>

        {data.length > 1 && (
          <div className="carousel-section__indicators">
            {data.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-section__dot ${
                  index === currentIndex ? 'carousel-section__dot--active' : ''
                } ${color}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
