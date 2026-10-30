// 2D Pixel Art Engine: Game Loop, Rendering, Collision, and Controls (PC + Mobile)
import { gameState } from './state.js';
import { sprites } from './sprites.js';
import { sounds } from './audio.js';
import { ZONES } from './zones.js';

export class GameEngine {
  constructor(canvas, uiHooks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.uiHooks = uiHooks || {};

    this.keys = {};
    this.touchNav = { active: false, dx: 0, dy: 0 };
    this.targetPos = null; // for tap-to-move

    this.lastTime = performance.now();
    this.animTime = 0;
    this.fireFrame = 0;
    this.artifactFrame = 0;

    this.activeInteractable = null;
    this.isPaused = false;
    this.inModal = false;

    this.initControls();
  }

  initControls() {
    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (this.inModal) {
        if (e.key === 'Escape') {
          if (this.uiHooks.onCloseModal) this.uiHooks.onCloseModal();
        }
        return;
      }

      if (e.key.toLowerCase() === 'e' || e.key === ' ') {
        this.triggerInteraction();
      } else if (e.key.toLowerCase() === 'n') {
        if (this.uiHooks.onToggleNotebook) this.uiHooks.onToggleNotebook();
      } else if (e.key.toLowerCase() === 'i' || e.key === 'Tab') {
        e.preventDefault();
        if (this.uiHooks.onToggleInventory) this.uiHooks.onToggleInventory();
      } else if (e.key === 'Escape') {
        if (this.uiHooks.onToggleMenu) this.uiHooks.onToggleMenu();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Canvas click / tap to move
    this.canvas.addEventListener('click', (e) => {
      if (this.inModal || this.isPaused) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // If clicked near an interactable, interact directly
      const zone = ZONES[gameState.currentZone];
      if (zone) {
        for (const obj of zone.interactables) {
          if (
            clickX >= obj.x - 16 && clickX <= obj.x + obj.w + 16 &&
            clickY >= obj.y - 16 && clickY <= obj.y + obj.h + 16
          ) {
            // Check distance to player
            const p = gameState.player;
            const dist = Math.hypot(p.x + 12 - (obj.x + obj.w / 2), p.y + 16 - (obj.y + obj.h / 2));
            if (dist < 64) {
              this.executeInteract(obj);
              return;
            } else {
              this.targetPos = { x: obj.x + obj.w / 2 - 12, y: obj.y + obj.h + 10 };
              return;
            }
          }
        }
      }

      this.targetPos = { x: clickX - 12, y: clickY - 16 };
    });

    // Touch controls setup (Mobile D-pad)
    this.setupMobileControls();
  }

  setupMobileControls() {
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach((btn) => {
      const dir = btn.dataset.dir;

      const handleStart = (e) => {
        e.preventDefault();
        sounds.ensureContext();
        if (dir === 'up') this.touchNav.dy = -1;
        if (dir === 'down') this.touchNav.dy = 1;
        if (dir === 'left') this.touchNav.dx = -1;
        if (dir === 'right') this.touchNav.dx = 1;
        btn.classList.add('pressed');
      };

      const handleEnd = (e) => {
        e.preventDefault();
        if (dir === 'up' && this.touchNav.dy === -1) this.touchNav.dy = 0;
        if (dir === 'down' && this.touchNav.dy === 1) this.touchNav.dy = 0;
        if (dir === 'left' && this.touchNav.dx === -1) this.touchNav.dx = 0;
        if (dir === 'right' && this.touchNav.dx === 1) this.touchNav.dx = 0;
        btn.classList.remove('pressed');
      };

      btn.addEventListener('touchstart', handleStart, { passive: false });
      btn.addEventListener('touchend', handleEnd, { passive: false });
      btn.addEventListener('mousedown', handleStart);
      btn.addEventListener('mouseup', handleEnd);
      btn.addEventListener('mouseleave', handleEnd);
    });

    // Action button
    const actionBtn = document.getElementById('btn-mobile-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sounds.ensureContext();
        this.triggerInteraction();
      });
    }
  }

  triggerInteraction() {
    if (this.activeInteractable) {
      this.executeInteract(this.activeInteractable);
    }
  }

  executeInteract(obj) {
    sounds.ensureContext();
    sounds.playBlip();
    if (this.uiHooks.onInteract) {
      this.uiHooks.onInteract(obj);
    }
  }

  start() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      if (!this.isPaused && !this.inModal) {
        this.update(dt);
      }
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    const p = gameState.player;
    let mx = 0;
    let my = 0;

    // 1. Keyboard
    if (this.keys['w'] || this.keys['arrowup']) my -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) my += 1;
    if (this.keys['a'] || this.keys['arrowleft']) mx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) mx += 1;

    // 2. Touch D-pad
    if (this.touchNav.dx !== 0) mx = this.touchNav.dx;
    if (this.touchNav.dy !== 0) my = this.touchNav.dy;

    // 3. Tap-to-move target
    if (this.targetPos && mx === 0 && my === 0) {
      const dx = this.targetPos.x - p.x;
      const dy = this.targetPos.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        mx = dx / dist;
        my = dy / dist;
      } else {
        this.targetPos = null;
      }
    }

    if (mx !== 0 || my !== 0) {
      // Normalize diagonal
      const len = Math.hypot(mx, my);
      const nx = (mx / len) * p.speed * dt;
      const ny = (my / len) * p.speed * dt;

      // Update orientation
      if (Math.abs(mx) > Math.abs(my)) {
        p.dir = mx > 0 ? 'right' : 'left';
      } else {
        p.dir = my > 0 ? 'down' : 'up';
      }

      // Movement with Collision Detection
      this.moveWithCollision(p, nx, ny);
      p.isMoving = true;

      // Animation frame
      this.animTime += dt * 8;
      p.frame = Math.floor(this.animTime) % 3;

      // Footstep sound
      if (Math.floor(this.animTime) % 2 === 0 && Math.floor(this.animTime) !== this.lastStepFrame) {
        this.lastStepFrame = Math.floor(this.animTime);
        sounds.playStep();
        gameState.stats.stepsTaken++;
      }
    } else {
      p.isMoving = false;
      p.frame = 0;
    }

    // Animation timers for ambient objects
    this.fireFrame = Math.floor(performance.now() / 200) % 3;
    this.artifactFrame = Math.floor(performance.now() / 250) % 4;

    // Check interactable proximity
    this.checkInteractables();
  }

  moveWithCollision(p, dx, dy) {
    const zone = ZONES[gameState.currentZone];
    if (!zone) return;

    // Try X
    const newX = p.x + dx;
    if (!this.checkSolidCollision(newX, p.y, zone)) {
      p.x = newX;
    }

    // Try Y
    const newY = p.y + dy;
    if (!this.checkSolidCollision(p.x, newY, zone)) {
      p.y = newY;
    }
  }

  checkSolidCollision(x, y, zone) {
    // Player bounding box (feet: 16x10 at bottom of 24x32 sprite)
    const box = {
      l: x + 4,
      r: x + 20,
      t: y + 20,
      b: y + 30
    };

    // Bounds check
    if (box.l < 0 || box.r >= zone.width * 32 || box.t < 0 || box.b >= zone.height * 32) {
      return true;
    }

    const tL = Math.floor(box.l / 32);
    const tR = Math.floor(box.r / 32);
    const tT = Math.floor(box.t / 32);
    const tB = Math.floor(box.b / 32);

    for (let r = tT; r <= tB; r++) {
      for (let c = tL; c <= tR; c++) {
        if (r >= 0 && r < zone.height && c >= 0 && c < zone.width) {
          if (zone.collision[r][c] === 1) return true; // solid wall
        }
      }
    }
    return false;
  }

  checkInteractables() {
    const zone = ZONES[gameState.currentZone];
    if (!zone) return;

    const p = gameState.player;
    const px = p.x + 12;
    const py = p.y + 20;

    let closest = null;
    let closestDist = 48; // max interact reach

    for (const obj of zone.interactables) {
      const cx = obj.x + obj.w / 2;
      const cy = obj.y + obj.h / 2;
      const d = Math.hypot(px - cx, py - cy);
      if (d < closestDist) {
        closest = obj;
        closestDist = d;
      }
    }

    if (this.activeInteractable !== closest) {
      this.activeInteractable = closest;
      if (this.uiHooks.onPromptChange) {
        this.uiHooks.onPromptChange(closest);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const zone = ZONES[gameState.currentZone];
    if (!zone) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render Tiles
    this.renderTilemap(ctx, zone);

    // 2. Render Furniture & Objects
    this.renderObjects(ctx, zone);

    // 3. Render Player (Lyra)
    this.renderPlayer(ctx);

    // 4. Render Atmospheric Lighting & Scanlines
    this.renderLighting(ctx, zone);
  }

  renderTilemap(ctx, zone) {
    const zId = gameState.currentZone;
    const floorKey = zId === 1 ? 'tile_study_floor' : zId === 2 ? 'tile_gallery_floor' : 'tile_vault_floor';
    const wallKey = zId === 1 ? 'tile_study_wall' : zId === 2 ? 'tile_gallery_wall' : 'tile_vault_wall';

    const floorSpr = sprites.get(floorKey);
    const wallSpr = sprites.get(wallKey);

    for (let r = 0; r < zone.height; r++) {
      for (let c = 0; c < zone.width; c++) {
        const x = c * 32;
        const y = r * 32;
        const tileType = zone.collision[r][c];

        if (tileType === 1) {
          if (wallSpr) ctx.drawImage(wallSpr, x, y);
        } else {
          if (floorSpr) ctx.drawImage(floorSpr, x, y);
        }

        // Zone 2 Laser Grid Tiles on floor
        if (zId === 2 && r >= 4 && r <= 8 && c >= 4 && c <= 8) {
          const lKey = gameState.flags.laserFloorSolved ? 'tile_laser_safe' : 'tile_laser_idle';
          const lSpr = sprites.get(lKey);
          if (lSpr) ctx.drawImage(lSpr, x, y);
        }
      }
    }
  }

  renderObjects(ctx, zone) {
    const zId = gameState.currentZone;

    if (zId === 1) {
      // Bookshelf
      const bookSpr = sprites.get('furniture_bookshelf');
      if (bookSpr) {
        ctx.drawImage(bookSpr, 9 * 32, 1 * 32);
        ctx.drawImage(bookSpr, 10 * 32, 1 * 32);
      }

      // Writing Desk
      const deskSpr = sprites.get('furniture_desk');
      if (deskSpr) ctx.drawImage(deskSpr, 1 * 32, 1 * 32);

      // Portraits of 4 Confidants
      const portraits = ['portrait_butler', 'portrait_scribe', 'portrait_chemist', 'portrait_guard'];
      portraits.forEach((id, idx) => {
        const pSpr = sprites.get(id);
        if (pSpr) ctx.drawImage(pSpr, (4 + idx) * 32, 1 * 32);
      });

      // Fireplace (Animated)
      const fireSpr = sprites.get(`furniture_fireplace_${this.fireFrame}`);
      if (fireSpr) ctx.drawImage(fireSpr, 1 * 32, 3 * 32);

      // Grandfather Clock
      const clockSpr = sprites.get('furniture_clock');
      if (clockSpr) ctx.drawImage(clockSpr, 13 * 32, 2.5 * 32);

      // Scales Pedestal (5 slots)
      const scaleSpr = sprites.get('pedestal_scales');
      if (scaleSpr) {
        for (let i = 0; i < 5; i++) {
          ctx.drawImage(scaleSpr, (4 + i) * 32, 5 * 32);
          // Draw placed relic if any
          const placedRelic = gameState.scaleSlots[i];
          if (placedRelic) {
            const rSpr = sprites.get(`item_${placedRelic}`);
            if (rSpr) ctx.drawImage(rSpr, (4 + i) * 32 + 4, 5 * 32 + 2);
          }
        }
      }
    } 
    else if (zId === 2) {
      // 4 Masterpiece Paintings on wall
      const pNames = ['painting_euler', 'painting_fibonacci', 'painting_symmetry', 'painting_prism'];
      const pCols = [1, 3, 5, 7];
      pNames.forEach((name, idx) => {
        const pSpr = sprites.get(name);
        if (pSpr) ctx.drawImage(pSpr, pCols[idx] * 32, 1 * 32);
      });

      // Velvet Ropes
      const ropeSpr = sprites.get('gallery_velvet_rope');
      if (ropeSpr) {
        ctx.drawImage(ropeSpr, 2 * 32, 3 * 32);
        ctx.drawImage(ropeSpr, 13 * 32, 3 * 32);
      }

      // Vault Blast Door Preview at top
      const vDoorSpr = sprites.get('vault_blast_door');
      if (vDoorSpr) ctx.drawImage(vDoorSpr, 9 * 32, 0 * 32);
    } 
    else if (zId === 3) {
      // Central Chronos Oculus Pedestal
      const ocSpr = sprites.get(`artifact_pedestal_${this.artifactFrame}`);
      if (ocSpr) {
        ctx.drawImage(ocSpr, 7 * 32, 1 * 32);
      }

      // Modulo Rotor Lock Terminal
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(1 * 32 + 4, 1 * 32 + 8, 56, 48);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText('MODULO TERMINAL', 1 * 32 + 6, 1 * 32 + 24);

      // Optics Terminal
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(13 * 32 + 4, 1 * 32 + 8, 56, 48);
      ctx.fillStyle = '#c084fc';
      ctx.font = '10px monospace';
      ctx.fillText('OPTICS MATRIX', 13 * 32 + 8, 1 * 32 + 24);
    }

    // Floating Interaction Prompt Marker
    if (this.activeInteractable) {
      const obj = this.activeInteractable;
      const bob = Math.sin(performance.now() / 150) * 3;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      const markerX = obj.x + obj.w / 2;
      const markerY = obj.y - 10 + bob;
      ctx.moveTo(markerX, markerY);
      ctx.lineTo(markerX - 6, markerY - 8);
      ctx.lineTo(markerX + 6, markerY - 8);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderPlayer(ctx) {
    const p = gameState.player;
    const sprKey = `player_${p.dir}_${p.frame}`;
    const spr = sprites.get(sprKey);
    if (spr) {
      ctx.drawImage(spr, Math.round(p.x), Math.round(p.y));
    }
  }

  renderLighting(ctx, zone) {
    const zId = gameState.currentZone;
    const p = gameState.player;

    // Vignette / Moody ambient lighting
    const grad = ctx.createRadialGradient(
      p.x + 12, p.y + 16, 40,
      p.x + 12, p.y + 16, 260
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, zId === 3 ? 'rgba(5, 8, 18, 0.75)' : 'rgba(10, 8, 15, 0.65)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Warm Fireplace Glow in Study
    if (zId === 1) {
      const fGrad = ctx.createRadialGradient(1 * 32 + 16, 3 * 32 + 16, 10, 1 * 32 + 16, 3 * 32 + 16, 90);
      fGrad.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
      fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Cyan Vault Core Pulse in Vault
    if (zId === 3) {
      const pulse = (Math.sin(performance.now() / 400) + 1) * 0.1;
      const cGrad = ctx.createRadialGradient(7 * 32 + 16, 2 * 32 + 16, 15, 7 * 32 + 16, 2 * 32 + 16, 140);
      cGrad.addColorStop(0, `rgba(34, 211, 238, ${0.3 + pulse})`);
      cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
