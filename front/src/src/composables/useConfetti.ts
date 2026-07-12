/**
 * @/composables/useConfetti.ts
 * 
 * A simple composable to trigger a confetti animation.
 * This isolates the canvas-confetti import to prevent build issues.
 */
export function useConfetti() {
  // Acessa a função confetti do objeto global 'window'
  const confetti = (window as any).confetti;

  /**
   * Triggers the confetti animation with optional settings.
   */
  const fire = () => {
    if (confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      console.warn('Confetti animation is not available. Was the script loaded?');
    }
  };

  return { fire };
}