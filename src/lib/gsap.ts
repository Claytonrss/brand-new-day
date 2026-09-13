import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single GSAP entry point — registering ScrollTrigger more than once is
 * harmless, but it was repeated in every consumer; import from here instead.
 */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
