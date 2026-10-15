// src/js/swiper-init.js

import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

export function iniciarSwiper() {
  // ==================== Slider de destaques (1 por vez) ====================
  const destaquesContainers = document.querySelectorAll('.slider-destaques');

  destaquesContainers.forEach((container) => {
    if (container.swiper) return;

    const wrapper = container.querySelector('.swiper-wrapper');
    const nextButton = container.querySelector('.swiper-button-next');
    const prevButton = container.querySelector('.swiper-button-prev');

    if (!wrapper || !nextButton || !prevButton) return;

    const totalSlides = wrapper.querySelectorAll('.swiper-slide').length;

    if (totalSlides < 1) return;

    new Swiper(container, {
      modules: [Navigation, Autoplay],

      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 0,

      loop: totalSlides >= 2,

      speed: 500,

      autoplay:
        totalSlides >= 2
          ? {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false,

      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },

      watchOverflow: true,
    });
  });

  // ==================== Slider de categorias ====================
  const categoriasContainers = document.querySelectorAll('.slider-categorias');

  categoriasContainers.forEach((container) => {
    if (container.swiper) return;

    const wrapper = container.querySelector('.swiper-wrapper');
    const nextButton = container.querySelector('.swiper-button-next');
    const prevButton = container.querySelector('.swiper-button-prev');

    if (!wrapper || !nextButton || !prevButton) return;

    const totalSlides = wrapper.querySelectorAll('.swiper-slide').length;

    if (totalSlides < 1) return;

    new Swiper(container, {
      modules: [Navigation],

      // Mobile
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 12,

      loop: totalSlides > 3,

      speed: 500,

      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },

      watchOverflow: true,

      // Tablet e desktop
      breakpoints: {
        768: {
          slidesPerView: 2,
          slidesPerGroup: 1,
          spaceBetween: 16,
        },

        1024: {
          slidesPerView: 3,
          slidesPerGroup: 1,
          spaceBetween: 20,
        },
      },
    });
  });
}

// ==================== Inicialização automática ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarSwiper);
} else {
  iniciarSwiper();
}