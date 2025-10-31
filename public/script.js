// API URL (change in production)
const API_URL = window.location.origin;

// Vercel Analytics
import { inject } from "@vercel/analytics";
inject();

// Elements
const form = document.getElementById("waitlist-form");
const submitBtn = document.getElementById("submit-btn");
const btnText = document.querySelector(".btn-text");
const btnLoader = document.querySelector(".btn-loader");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const positionNumber = document.getElementById("position-number");
const waitlistCountEl = document.getElementById("waitlist-count");

// Load waitlist count on page load
async function loadWaitlistCount() {
  try {
    const response = await fetch(`${API_URL}/api/waitlist/count`);
    const data = await response.json();

    if (data.success) {
      animateCounter(waitlistCountEl, data.count);
    }
  } catch (error) {
    console.error("Error loading count:", error);
    waitlistCountEl.textContent = "0";
  }
}

// Animate counter
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 30;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 30);
}

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  // Validation
  if (!email) {
    showError("Veuillez entrer votre email");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("Veuillez entrer un email valide");
    return;
  }

  // Show loading state
  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/api/waitlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(data.position);
      // Update count
      loadWaitlistCount();
    } else {
      showError(data.message || "Une erreur est survenue");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("Impossible de se connecter au serveur. Veuillez réessayer.");
  } finally {
    setLoading(false);
  }
});

// Show loading state
function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    btnText.style.display = "none";
    btnLoader.style.display = "inline-block";
  } else {
    btnText.style.display = "inline-block";
    btnLoader.style.display = "none";
  }
}

// Show success message
function showSuccess(position) {
  form.style.display = "none";
  errorMessage.style.display = "none";
  successMessage.style.display = "block";
  positionNumber.textContent = `#${position}`;

  // Confetti effect (optional)
  createConfetti();
}

// Show error message
function showError(message) {
  errorText.textContent = message;
  errorMessage.style.display = "block";
  form.style.display = "none";
  successMessage.style.display = "none";
}

// Reset form
function resetForm() {
  form.style.display = "block";
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
  form.reset();
}

// Simple confetti effect
function createConfetti() {
  const colors = ["#d97757", "#f2a98c", "#f4976c", "#5a8677"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.top = "-10px";
      confetti.style.opacity = "1";
      confetti.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      confetti.style.transition = "all 3s ease-out";
      confetti.style.zIndex = "9999";
      confetti.style.pointerEvents = "none";
      confetti.style.borderRadius = "2px";

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.style.top = window.innerHeight + "px";
        confetti.style.opacity = "0";
        confetti.style.transform = "rotate(" + Math.random() * 720 + "deg)";
      }, 10);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }, i * 30);
  }
}

// Initialize
loadWaitlistCount();

// Refresh count every 30 seconds
setInterval(loadWaitlistCount, 30000);
