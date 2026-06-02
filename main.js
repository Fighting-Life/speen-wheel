(() => {
  "use strict";

  const DEFAULT_CPA_LINK_v1 =
    "https://smrturl.co/a/se9c2956c51/20377?s1=brian-smith";
  const DEFAULT_CPA_LINK_v2 =
    "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan";
  let CPA_LINK = DEFAULT_CPA_LINK_v2;

  let audioCtx = null;
  let tickIntervalId = null;
  let whooshNode = null;
  let whooshGain = null;

  function getAudioCtx() {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTick(freq = 900, vol = 0.18) {
    try {
      const ac = getAudioCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.06);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.07);
    } catch (e) {}
  }

  function startSpinSound() {
    try {
      const ac = getAudioCtx();

      /* Whoosh oscillator */
      whooshNode = ac.createOscillator();
      whooshGain = ac.createGain();

      // White noise buffer for texture
      const bufSize = ac.sampleRate * 2;
      const noiseBuffer = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

      const noiseSource = ac.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Band-pass filter to shape noise into "whoosh"
      const bpf = ac.createBiquadFilter();
      bpf.type = "bandpass";
      bpf.frequency.setValueAtTime(200, ac.currentTime);
      bpf.frequency.linearRampToValueAtTime(900, ac.currentTime + 1.5);
      bpf.Q.value = 1.2;

      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(0, ac.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.22, ac.currentTime + 0.3);

      noiseSource.connect(bpf);
      bpf.connect(noiseGain);
      noiseGain.connect(ac.destination);
      noiseSource.start();

      /* Save refs to stop later */
      whooshNode._noiseSource = noiseSource;
      whooshNode._noiseGain = noiseGain;
      whooshNode._bpf = bpf;
      whooshNode._noiseGain = noiseGain;

      // Tick interval â€” fast at start, slows with velocity
      let tickRate = 60;
      tickIntervalId = setInterval(() => {
        if (!spinning) {
          clearInterval(tickIntervalId);
          return;
        }
        // pitch the tick with current velocity
        const pitch = 400 + Math.min(velocity, 0.4) * 3000;
        playTick(pitch, 0.14);
        // slow tick rate as wheel decelerates
        const newRate = Math.max(60, 500 - velocity * 3000);
        if (Math.abs(newRate - tickRate) > 30) {
          clearInterval(tickIntervalId);
          tickRate = newRate;
          tickIntervalId = setInterval(arguments.callee, tickRate);
        }
      }, tickRate);
    } catch (e) {}
  }

  function stopSpinSound() {
    try {
      clearInterval(tickIntervalId);
      if (whooshNode && whooshNode._noiseGain) {
        const ac = getAudioCtx();
        whooshNode._noiseGain.gain.linearRampToValueAtTime(
          0,
          ac.currentTime + 0.5,
        );
        setTimeout(() => {
          try {
            whooshNode._noiseSource.stop();
          } catch (e) {}
        }, 600);
      }
    } catch (e) {}
  }

  function playWinSound() {
    try {
      const ac = getAudioCtx();
      const notes = [523, 659, 784, 1047]; // C E G C
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) {}
  }

  const PRIZESV1 = [
    {
      label: "Cash App\n$50",
      name: "Cash App",
      value: "$50",
      emoji: "💸",
      color: "#00D632",
      link: "https://smrturl.co/a/se9c2956c51/11788?s1=brian-smith",
    },
    {
      label: "Amazon\n$150",
      name: "Amazon Gift Card",
      value: "$150",
      emoji: "📦",
      color: "#FF9900",
      link: "https://smrturl.co/a/se9c2956c51/19630?s1=brian-smith",
    },
    {
      label: "PayPal\n$100",
      name: "PayPal Cash",
      value: "$100",
      emoji: "💰",
      color: "#003087",
      link: "https://smrturl.co/a/se9c2956c51/20377?s1=brian-smith",
    },
    {
      label: "Walmart\n$75",
      name: "Walmart Gift Card",
      value: "$75",
      emoji: "🛒",
      color: "#007DC6",
      link: "https://smrturl.co/a/se9c2956c51/17412?s1=brian-smith",
    },
    {
      label: "Cash App\n$150",
      name: "Cash App",
      value: "$150",
      emoji: "💸",
      color: "#00D632",
      link: "https://smrturl.co/a/se9c2956c51/20133?s1=brian-smith",
    },
    {
      label: "PayPal\n$50",
      name: "PayPal Cash",
      value: "$50",
      emoji: "💰",
      color: "#009CDE",
      link: "https://smrturl.co/a/se9c2956c51/576?s1=brian-smith",
    },
    {
      label: "Amazon\n$100",
      name: "Amazon Gift Card",
      value: "$100",
      emoji: "📦",
      color: "#FF6900",
      link: "https://smrturl.co/a/se9c2956c51/19630?s1=brian-smith",
    },
    {
      label: "Walmart\n$150",
      name: "Walmart Gift Card",
      value: "$150",
      emoji: "🛒",
      color: "#0071CE",
      link: "https://smrturl.co/a/se9c2956c51/20377?s1=brian-smith",
    },
  ];

  const PRIZESV2 = [
    {
      label: "Cash App\n$50",
      name: "Cash App",
      value: "$50",
      emoji: "💸",
      color: "#00D632",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "Amazon\n$150",
      name: "Amazon Gift Card",
      value: "$150",
      emoji: "📦",
      color: "#FF9900",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "PayPal\n$100",
      name: "PayPal Cash",
      value: "$100",
      emoji: "💰",
      color: "#003087",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "Walmart\n$75",
      name: "Walmart Gift Card",
      value: "$75",
      emoji: "🛒",
      color: "#007DC6",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "Cash App\n$150",
      name: "Cash App",
      value: "$150",
      emoji: "💸",
      color: "#00D632",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "PayPal\n$50",
      name: "PayPal Cash",
      value: "$50",
      emoji: "💰",
      color: "#009CDE",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "Amazon\n$100",
      name: "Amazon Gift Card",
      value: "$100",
      emoji: "📦",
      color: "#FF6900",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      label: "Walmart\n$150",
      name: "Walmart Gift Card",
      value: "$150",
      emoji: "🛒",
      color: "#0071CE",
      link: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
  ];

  const SEGMENT_COUNT = PRIZESV2.length;
  const ARC = (Math.PI * 2) / SEGMENT_COUNT;

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  let wheelSize = canvas.width;
  let R = wheelSize / 2;

  function syncCanvasSize() {
    const cssSize = Math.round(
      canvas.getBoundingClientRect().width || canvas.clientWidth || 300,
    );
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    wheelSize = cssSize;
    R = wheelSize / 2;
    canvas.width = Math.round(wheelSize * dpr);
    canvas.height = Math.round(wheelSize * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let rotation = 0;
  let spinning = false;
  let velocity = 0;
  let rafId = null;
  let hasPlayed = false;
  let idleAngle = 0;

  const STORAGE_KEY = "ls_spin_played_v1";
  const PRIZE_STORAGE_KEY = "ls_current_prize_v1";

  function getFingerprint() {
    const ua = navigator.userAgent;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const scr = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const raw = `${ua}|${lang}|${tz}|${scr}`;
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(36);
  }

  function checkAlreadyPlayed() {
    try {
      const fp = getFingerprint();
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return !!(data[fp] || data["played"]);
    } catch {
      return false;
    }
  }

  function markPlayed() {
    try {
      const fp = getFingerprint();
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      data[fp] = Date.now();
      data["played"] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  function getStoredPrize() {
    try {
      const fp = getFingerprint();
      const data = JSON.parse(localStorage.getItem(PRIZE_STORAGE_KEY) || "{}");
      return data[fp] || data.current || null;
    } catch {
      return null;
    }
  }

  function saveCurrentPrize(prize) {
    try {
      const fp = getFingerprint();
      const current = {
        name: prize.name,
        value: prize.value,
        link: prize.link || DEFAULT_CPA_LINK_v2,
        wonAt: Date.now(),
      };
      const data = JSON.parse(localStorage.getItem(PRIZE_STORAGE_KEY) || "{}");
      data[fp] = current;
      data.current = current;
      localStorage.setItem(PRIZE_STORAGE_KEY, JSON.stringify(data));
      return current;
    } catch {
      return {
        name: prize.name,
        value: prize.value,
        link: prize.link || DEFAULT_CPA_LINK_v2,
        wonAt: Date.now(),
      };
    }
  }

  function getCurrentClaimLink() {
    const storedPrize = getStoredPrize();
    return storedPrize?.link || CPA_LINK || DEFAULT_CPA_LINK_v2;
  }

  function drawWheel(rot) {
    ctx.clearRect(0, 0, wheelSize, wheelSize);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const startAngle = rot + i * ARC - Math.PI / 2;
      const endAngle = startAngle + ARC;

      /* segment fill */
      ctx.beginPath();
      ctx.moveTo(R, R);
      ctx.arc(R, R, R - 4, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = PRIZESV2[i].color;
      ctx.fill();

      /* segment border */
      ctx.strokeStyle = "rgba(0,0,0,.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      /* shine overlay */
      const grad = ctx.createRadialGradient(R, R, R * 0.1, R, R, R - 4);
      grad.addColorStop(0, "rgba(255,255,255,.06)");
      grad.addColorStop(1, "rgba(0,0,0,.12)");
      ctx.fillStyle = grad;
      ctx.fill();

      /* label */
      ctx.save();
      ctx.translate(R, R);
      ctx.rotate(startAngle + ARC / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, Math.round(R * 0.08))}px Nunito, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,.8)";
      ctx.shadowBlur = 4;

      const lines = PRIZESV2[i].label.split("\n");
      lines.forEach((ln, li) => {
        ctx.fillText(
          ln,
          R - Math.max(12, R * 0.1),
          li * (R * 0.105) - (lines.length - 1) * (R * 0.052),
        );
      });
      ctx.restore();
    }

    /* rim */
    ctx.beginPath();
    ctx.arc(R, R, R - 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,215,0,.6)";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  syncCanvasSize();
  drawWheel(0);

  window.addEventListener("resize", () => {
    syncCanvasSize();
    drawWheel(rotation + idleAngle);
  });

  function getWinningIndex(rot) {
    const norm = ((rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const angle = (Math.PI * 2 - norm + Math.PI / 2) % (Math.PI * 2);
    return Math.floor(angle / ARC) % SEGMENT_COUNT;
  }

  function spawnConfetti() {
    const colors = [
      "#FFD700",
      "#FF4D6D",
      "#00D632",
      "#4FC3F7",
      "#FF6B35",
      "#fff",
    ];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.cssText = `
          left:${Math.random() * 100}vw;
          top:${-10 - Math.random() * 20}px;
          background:${colors[i % colors.length]};
          animation-delay:${Math.random() * 0.8}s;
          animation-duration:${2 + Math.random() * 1.5}s;
          transform:rotate(${Math.random() * 360}deg);
          width:${6 + Math.random() * 8}px;
          height:${8 + Math.random() * 10}px;
          border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  function showCongrats(idx) {
    const prize = PRIZESV2[idx];
    const currentPrize = saveCurrentPrize(prize);
    CPA_LINK = currentPrize.link;
    document.getElementById("modal-emoji").textContent = prize.emoji;
    document.getElementById("modal-prize-name").textContent = prize.name;
    document.getElementById("modal-prize-value").textContent = prize.value;
    applyClaimLinks();
    document.getElementById("modal-overlay").classList.add("show");
  }

  const FRICTION = 0.985;
  const MIN_SPINS = 5;

  function spinFrame() {
    rotation += velocity;
    velocity *= FRICTION;
    drawWheel(rotation);

    if (velocity > 0.003) {
      rafId = requestAnimationFrame(spinFrame);
    } else {
      velocity = 0;
      spinning = false;
      stopSpinSound();
      const idx = getWinningIndex(rotation);
      setTimeout(() => {
        playWinSound();
        spawnConfetti();
        showCongrats(idx);
      }, 300);
    }
  }

  const spinBtn = document.getElementById("spinBtn");
  const spinMsg = document.getElementById("spin-msg");
  const playBanner = document.getElementById("played-banner");
  const ticketStatus = document.getElementById("ticket-status");
  const claimBtn = document.getElementById("claim-btn");
  const playedClaimBtn = document.getElementById("played-claim-btn");
  const playedBannerClaimBtn = document.getElementById(
    "played-banner-claim-btn",
  );
  const extraSpinBtnAfterClaimed = document.getElementById(
    "extra-spin-btn-after-claimed",
  );
  const extraSpinBtnModal = document.getElementById("extra-spin-btn-modal");

  function applyClaimLinks() {
    CPA_LINK = getCurrentClaimLink();
    claimBtn.href = CPA_LINK;
    playedClaimBtn.href = CPA_LINK;
    playedBannerClaimBtn.href = CPA_LINK;
  }

  applyClaimLinks();

  if (checkAlreadyPlayed()) {
    hasPlayed = true;
    spinBtn.disabled = true;
    playBanner.style.display = "block";
    ticketStatus.textContent = "SPIN USED";
    spinMsg.textContent = "You have already used your free spin.";

    document.getElementById("played-overlay").classList.add("show");
  }

  spinBtn.addEventListener("click", () => {
    if (spinning || hasPlayed) return;

    hasPlayed = true;
    markPlayed();
    spinning = true;
    spinBtn.disabled = true;
    ticketStatus.textContent = "SPIN USED";
    spinMsg.textContent = "Spinningâ€¦ good luck! ðŸ€";

    const extra = Math.random() * Math.PI * 2;
    const target = Math.PI * 2 * (MIN_SPINS + 3 * Math.random()) + extra;

    velocity = target * (1 - FRICTION);

    cancelAnimationFrame(rafId);
    startSpinSound();
    spinFrame();
  });

  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("show");
  });
  document.getElementById("played-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("show");
  });

  const additionalOffer = [
    {
      name: "PrizeZappy - Chance to Win",
      value: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      name: "DailySurge - Coke vs Pepsi",
      value: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      name: "GnG - CashApp",
      value: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
    {
      name: "CTConnect - CashApp",
      value: "https://adclub.g2afse.com/click?pid=1274&offer_id=49&sub1=ryan",
    },
  ];

  const OFFER_PENDING_KEY = "ls_bonus_offer_pending_v1";
  const EXTRA_SPIN_WAIT_MS = 60 * 1000;
  const offerOverlay = document.getElementById("offer-overlay");
  const offerList = document.getElementById("offer-list");
  const offerStatus = document.getElementById("offer-status");
  const offerCloseBtn = document.getElementById("offer-close-btn");

  function setOfferStatus(message = "", type = "") {
    offerStatus.textContent = message;
    offerStatus.className = `offer-status ${type}`.trim();
  }

  function getPendingOffer() {
    try {
      return JSON.parse(localStorage.getItem(OFFER_PENDING_KEY) || "null");
    } catch {
      return null;
    }
  }

  function savePendingOffer(offer) {
    localStorage.setItem(
      OFFER_PENDING_KEY,
      JSON.stringify({
        name: offer.name,
        startedAt: Date.now(),
      }),
    );
  }

  function clearPendingOffer() {
    localStorage.removeItem(OFFER_PENDING_KEY);
  }

  function unlockExtraSpin() {
    try {
      const fp = getFingerprint();
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      delete data[fp];
      delete data.played;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}

    clearPendingOffer();
    applyClaimLinks();
    hasPlayed = false;
    spinBtn.disabled = false;
    playBanner.style.display = "none";
    ticketStatus.textContent = "BONUS SPIN READY";
    spinMsg.textContent = "Your bonus spin is unlocked. Good luck!";
    document.getElementById("played-overlay").classList.remove("show");
    offerOverlay.classList.remove("show");
    setOfferStatus("Bonus spin unlocked. You can spin again now.", "success");
  }

  function checkPendingOfferCompletion(showMessage = false) {
    const pending = getPendingOffer();
    if (!pending || !pending.startedAt) return false;

    const elapsed = Date.now() - pending.startedAt;
    if (elapsed >= EXTRA_SPIN_WAIT_MS) {
      unlockExtraSpin();
      return true;
    }

    if (showMessage) {
      const remainingSeconds = Math.ceil((EXTRA_SPIN_WAIT_MS - elapsed) / 1000);
      setOfferStatus(
        `Keep the offer open a little longer. ${remainingSeconds}s remaining.`,
        "warning",
      );
    }

    return false;
  }

  function renderOfferList() {
    offerList.innerHTML = "";

    additionalOffer.forEach((offer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "offer-option";
      button.innerHTML = `
        <span class="offer-option-name">${offer.name}</span>
        <span class="offer-option-action">OPEN</span>
      `;
      button.addEventListener("click", () => {
        savePendingOffer(offer);
        setOfferStatus(
          "Offer opened. Keep it open for 1 minute, then return here.",
          "warning",
        );
        window.open(offer.value, "_blank", "noopener,noreferrer");
      });
      offerList.appendChild(button);
    });
  }

  function showOfferDialog() {
    renderOfferList();
    checkPendingOfferCompletion(true);
    offerOverlay.classList.add("show");
  }

  function closeOfferDialog() {
    offerOverlay.classList.remove("show");
  }

  extraSpinBtnAfterClaimed.addEventListener("click", showOfferDialog);
  extraSpinBtnModal.addEventListener("click", showOfferDialog);
  offerCloseBtn.addEventListener("click", closeOfferDialog);
  offerOverlay.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeOfferDialog();
  });

  const floatAdOverlay = document.getElementById("float-ad-overlay");
  const floatAdBox = document.getElementById("float-ad-box");
  const floatAdSlot = document.getElementById("float-ad-slot");
  const floatAdClose = document.getElementById("float-ad-close");
  let pointerInsideFloatAd = false;

  function loadFloatAd() {
    if (!floatAdSlot || floatAdSlot.dataset.loaded === "true") return;

    floatAdSlot.dataset.loaded = "true";
    window.atOptions = {
      key: "62c406d8cc71855689db962800be30f2",
      format: "iframe",
      height: 60,
      width: 468,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/62c406d8cc71855689db962800be30f2/invoke.js";
    script.async = true;
    floatAdSlot.appendChild(script);
  }

  function closeFloatAd() {
    floatAdOverlay.classList.add("is-hidden");
    pointerInsideFloatAd = false;
  }

  floatAdBox.addEventListener("pointerenter", () => {
    pointerInsideFloatAd = true;
  });

  floatAdBox.addEventListener("pointerleave", () => {
    pointerInsideFloatAd = false;
  });

  floatAdBox.addEventListener("click", closeFloatAd);

  floatAdClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeFloatAd();
  });

  window.addEventListener("blur", () => {
    if (pointerInsideFloatAd) {
      setTimeout(closeFloatAd, 150);
    }
  });
  loadFloatAd();

  window.addEventListener("focus", () => checkPendingOfferCompletion(true));
  window.addEventListener("pageshow", () => checkPendingOfferCompletion(false));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkPendingOfferCompletion(true);
  });
  checkPendingOfferCompletion(false);

  function idleSpin() {
    if (!spinning) {
      idleAngle += 0.002;
      drawWheel(rotation + idleAngle);
    }
    requestAnimationFrame(idleSpin);
  }
  idleSpin();
})();
