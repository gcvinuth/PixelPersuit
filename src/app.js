// Main Game Application & Scene Controller
import { gameState } from './state.js';
import { sprites } from './sprites.js';
import { sounds } from './audio.js';
import { ZONES } from './zones.js';
import { puzzles } from './puzzles.js';
import { notebook } from './notebook.js';
import { GameEngine } from './engine.js';

class App {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalContent = document.getElementById('modal-body');
    this.notebookOverlay = document.getElementById('notebook-overlay');
    this.dialogueBox = document.getElementById('dialogue-box');
    this.dialogueText = document.getElementById('dialogue-text');
    this.promptBar = document.getElementById('prompt-bar');
    this.promptText = document.getElementById('prompt-text');
    this.zoneTitle = document.getElementById('zone-title');
    this.timerDisplay = document.getElementById('timer-display');

    this.engine = null;
    this.deferredPrompt = null;

    this.init();
  }

  init() {
    // 1. Setup PWA Service Worker & Install Prompt
    this.setupPWA();

    // 2. Setup Canvas Resolution
    this.canvas.width = 480;
    this.canvas.height = 384;

    // 3. Initialize Game Engine
    this.engine = new GameEngine(this.canvas, {
      onInteract: (obj) => this.handleInteraction(obj),
      onPromptChange: (obj) => this.handlePromptChange(obj),
      onCloseModal: () => this.closeModal(),
      onToggleNotebook: () => notebook.toggle(this.notebookOverlay),
      onToggleInventory: () => this.toggleInventoryModal(),
      onToggleMenu: () => this.showMenu()
    });

    // 4. Bind Global UI Events
    this.bindUI();

    // 5. Check Saved Game
    const hasSave = gameState.load();
    if (hasSave) {
      document.getElementById('btn-continue').classList.remove('hidden');
    }

    // 6. Start Timer Tick
    setInterval(() => this.updateTimer(), 1000);
  }

  setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('PWA ServiceWorker registered with scope:', reg.scope))
          .catch(err => console.warn('ServiceWorker registration error:', err));
      });
    }

    const installBtn = document.getElementById('btn-install-pwa');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (installBtn) installBtn.classList.remove('hidden');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          console.log('User response to install:', outcome);
          this.deferredPrompt = null;
          installBtn.classList.add('hidden');
        }
      });
    }
  }

  bindUI() {
    // Title Screen Buttons
    document.getElementById('btn-start-game').addEventListener('click', () => {
      sounds.init();
      sounds.playBlip();
      gameState.reset();
      this.startHeist();
    });

    const contBtn = document.getElementById('btn-continue');
    contBtn.addEventListener('click', () => {
      sounds.init();
      sounds.playBlip();
      this.startHeist();
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      sounds.playBlip();
      this.showDialogue(
        "MISSION BRIEFING - THE HEIST OF THE CHRONOS OCULUS\n\n" +
        "You play as Lyra 'Spectre' Vance, phantom thief.\n" +
        "Baron Von Klaus has secured the artifact across three intellectual defense zones:\n" +
        "1. Private Study: Knights & Knaves truth deduction & 5-relic scale weighings.\n" +
        "2. Art Gallery: Euler graph theory, Fibonacci, and Hamiltonian laser floor.\n" +
        "3. The Vault: Chinese Remainder Theorem modulo dial & quantum optics deflector.\n\n" +
        "CONTROLS:\n" +
        "• PC: WASD / Arrows to move, [E] or [Space] to interact, [N] for Notebook/Scratchpad, [I] for Inventory.\n" +
        "• Mobile: Virtual D-Pad, [A] button to interact, tap interactables directly on screen!"
      );
    });

    // Header buttons
    document.getElementById('btn-open-notebook').addEventListener('click', () => {
      sounds.ensureContext();
      sounds.playBlip();
      notebook.toggle(this.notebookOverlay);
    });

    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      sounds.ensureContext();
      const muted = sounds.toggleMute();
      document.getElementById('btn-toggle-sound').textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('btn-toggle-controls').addEventListener('click', () => {
      sounds.playBlip();
      const dpad = document.getElementById('mobile-dpad-container');
      const action = document.getElementById('mobile-action-container');
      const isHidden = dpad.classList.contains('force-hidden');
      if (isHidden) {
        dpad.classList.remove('force-hidden');
        action.classList.remove('force-hidden');
        document.getElementById('btn-toggle-controls').textContent = '🎮 Pad: ON';
      } else {
        dpad.classList.add('force-hidden');
        action.classList.add('force-hidden');
        document.getElementById('btn-toggle-controls').textContent = '🎮 Pad: OFF';
      }
    });

    // Close Modal Button
    document.getElementById('btn-modal-close').addEventListener('click', () => {
      sounds.playBlip();
      this.closeModal();
    });

    // Dialogue Box Tap to dismiss
    this.dialogueBox.addEventListener('click', () => {
      sounds.playBlip();
      this.dialogueBox.classList.add('hidden');
    });

    // Close notebook overlay when clicking outside
    this.notebookOverlay.addEventListener('click', (e) => {
      if (e.target === this.notebookOverlay) {
        notebook.close();
      }
    });
  }

  startHeist() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    this.canvas.classList.remove('hidden');

    this.loadZone(gameState.currentZone);
    this.engine.start();

    // Initial mission clue
    if (gameState.clues.length === 0) {
      gameState.addClue("Infiltrated Private Study. The hidden vault door is sealed behind the 4 Confidants logic lock and the Equilibrium Scales.");
    }
  }

  loadZone(zoneId) {
    gameState.currentZone = zoneId;
    const zone = ZONES[zoneId];
    if (!zone) return;

    // Update player spawn if first entering
    this.zoneTitle.textContent = `ZONE ${zoneId}: ${zone.name.toUpperCase()}`;

    // Switch music
    sounds.startBGM(zone.bgMusicZone);
    gameState.save();
  }

  updateTimer() {
    if (gameState.stats.completed) return;
    const elapsed = Math.floor((gameState.stats.elapsedTime + (Date.now() - gameState.stats.startTime)) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    this.timerDisplay.textContent = `⏱ ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  handlePromptChange(obj) {
    if (obj) {
      this.promptText.textContent = `[E] ${obj.prompt}`;
      this.promptBar.classList.remove('hidden');
    } else {
      this.promptBar.classList.add('hidden');
    }
  }

  handleInteraction(obj) {
    switch (obj.type) {
      case 'desk':
        this.inspectDesk();
        break;
      case 'suspects':
        this.openSuspectsPuzzle();
        break;
      case 'bookshelf':
        this.inspectBookshelf();
        break;
      case 'fireplace':
        this.inspectFireplace();
        break;
      case 'clock':
        this.inspectClock();
        break;
      case 'scales':
        this.openScalesPuzzle();
        break;
      case 'study_door':
      case 'door_to_gallery':
        this.attemptEnterGallery();
        break;
      case 'door_back_to_study':
        this.transitionZone(1, { x: 7 * 32, y: 9 * 32, dir: 'up' });
        break;
      case 'painting_euler':
        this.openPaintingPuzzle('euler');
        break;
      case 'painting_fibonacci':
        this.openPaintingPuzzle('fibonacci');
        break;
      case 'painting_symmetry':
        this.openPaintingPuzzle('symmetry');
        break;
      case 'painting_prism':
        this.openPaintingPuzzle('prism');
        break;
      case 'laser_floor':
        this.openLaserFloorPuzzle();
        break;
      case 'door_to_vault':
        this.attemptEnterVault();
        break;
      case 'door_back_to_gallery':
        this.transitionZone(2, { x: 7 * 32, y: 10 * 32, dir: 'down' });
        break;
      case 'terminal_modular':
        this.openModularDialPuzzle();
        break;
      case 'terminal_optics':
        this.openOpticsPuzzle();
        break;
      case 'pedestal_artifact':
        this.attemptClaimArtifact();
        break;
      default:
        this.showDialogue(`You inspect the ${obj.name}. Nothing unusual catches your eye.`);
    }
  }

  // --- INSPECTION DIALOGUES ---
  inspectDesk() {
    if (gameState.flags.suspectsSolved) {
      this.showDialogue(
        "BARON'S DESK: The secret cedarwood compartment is open.\n" +
        "You retrieved the Ultraviolet Monocle and the five antique mass relics."
      );
    } else {
      this.showDialogue(
        "BARON'S DESK: A heavy roll-top bureau made of mahogany.\n" +
        "A brass letter tumbler is locked tight with four portrait seals.\n" +
        "Clue found: 'Deduce which of my four confidants speak truth to open this drawer.'"
      );
      gameState.addClue("Baron's desk requires solving the 4 Confidants logic puzzle.");
    }
  }

  inspectBookshelf() {
    this.showDialogue(
      "MATHEMATICAL ARCHIVE: Rows of leatherbound tomes on discrete mathematics.\n" +
      "A handwritten bookmark in Euler's treatise notes:\n" +
      "'For any connected planar network, Vertices - Edges + Faces = 2.'\n" +
      "Another page details Chinese Remainder congruences: 'Three coprime gears sync only at their unique minimal residue.'"
    );
    gameState.addClue("Bookshelf notes: Euler's formula V - E + F = 2 and Chinese Remainder Theorem coprime gear synchronization.");
  }

  inspectFireplace() {
    this.showDialogue(
      "STONE HEARTH: Warm glowing embers crackle.\n" +
      "Carved into the soot above the iron grate is an inscription:\n" +
      "'The scales seek truth: Emerald + Ruby = Sapphire. Two Rubies equal an Emerald. Sapphire + Emerald = Amber.'"
    );
    gameState.addClue("Fireplace inscription: E + R = S, 2R = E, S + E = A, M = A + R.");
  }

  inspectClock() {
    this.showDialogue(
      "ASTRONOMICAL CLOCK: The brass pendulum oscillates with mechanical precision.\n" +
      "Behind the glass face is etched: 'Modulo 3, Modulo 5, Modulo 7... when the gears align, the vault shall yield.'"
    );
  }

  // --- PUZZLE MODALS ---
  openSuspectsPuzzle() {
    this.openModal((body) => {
      puzzles.renderSuspectsPuzzle(body, () => {
        this.closeModal();
        this.showDialogue(
          "SUCCESS! The bureau's secret compartment clicks open!\n" +
          "You acquired the ULTRAVIOLET MONOCLE and 5 ANTIQUE MASS RELICS!"
        );
      });
    });
  }

  openScalesPuzzle() {
    if (!gameState.flags.suspectsSolved) {
      this.showDialogue("The Five Pedestals are empty! You need to find the five antiquity mass relics first (check the Baron's desk).");
      return;
    }
    this.openModal((body) => {
      puzzles.renderScalesPuzzle(body, () => {
        this.closeModal();
        this.showDialogue(
          "EQUILIBRIUM SOLVED!\n" +
          "The counterweights balance with a deep mechanical groan.\n" +
          "The heavy passage to the ART GALLERY is now UNLOCKED!"
        );
      });
    });
  }

  openPaintingPuzzle(paintingId) {
    this.openModal((body) => {
      puzzles.renderPaintingPuzzle(body, paintingId, () => {
        this.closeModal();
        this.showDialogue(`Masterpiece inspection complete! Architectural mechanism calibrated.`);
      });
    });
  }

  openLaserFloorPuzzle() {
    this.openModal((body) => {
      puzzles.renderLaserFloorPuzzle(body, () => {
        this.closeModal();
        this.showDialogue(
          "SECURITY OVERRIDE SUCCESSFUL!\n" +
          "The Hamiltonian circuit is complete across all sensor plates.\n" +
          "The laser barrier deactivates! The Vault Blast Door is accessible!"
        );
      });
    });
  }

  openModularDialPuzzle() {
    this.openModal((body) => {
      puzzles.renderModularDialPuzzle(body, () => {
        this.closeModal();
        this.showDialogue(
          "PRIMARY CONDUIT ONLINE!\n" +
          "The Chinese Remainder cogwheels lock into place at X = 29.\n" +
          "Left containment conduit illuminated!"
        );
      });
    });
  }

  openOpticsPuzzle() {
    this.openModal((body) => {
      puzzles.renderOpticsPuzzle(body, () => {
        this.closeModal();
        this.showDialogue(
          "SECONDARY CONDUIT ONLINE!\n" +
          "Both laser frequencies converge into their photodetector targets.\n" +
          "Right containment conduit illuminated!"
        );
      });
    });
  }

  // --- TRANSITIONS ---
  attemptEnterGallery() {
    if (gameState.flags.studyDoorOpen) {
      this.transitionZone(2, { x: 7 * 32, y: 11 * 32, dir: 'up' });
    } else {
      this.showDialogue("The passage to the Art Gallery is locked by the Five Scales of Equilibrium. Place all 5 relics in ascending mass order!");
    }
  }

  attemptEnterVault() {
    if (!gameState.flags.laserFloorSolved) {
      this.showDialogue("The Vault entrance is blocked by high-voltage floor lasers! Complete the Hamiltonian stepping traversal first.");
      return;
    }
    if (!gameState.hasItem('prism_key')) {
      this.showDialogue("The blast door keyhole requires the 'Gallery Prism Key' (hidden behind Masterpiece IV's anamorphic refraction).");
      return;
    }

    sounds.playDoorUnlock();
    this.transitionZone(3, { x: 7 * 32, y: 9 * 32, dir: 'up' });
  }

  attemptClaimArtifact() {
    if (!gameState.flags.modularDialSolved || !gameState.flags.laserOpticsSolved) {
      this.showDialogue(
        "CONTAINMENT FORCEFIELD ACTIVE!\n" +
        `Left Modular Rotor: ${gameState.flags.modularDialSolved ? '✓ ONLINE' : '✗ OFFLINE'}\n` +
        `Right Laser Optics: ${gameState.flags.laserOpticsSolved ? '✓ ONLINE' : '✗ OFFLINE'}\n\n` +
        "Solve both security terminals to drop the crystalline forcefield."
      );
      return;
    }

    // CLIMAX / VICTORY!
    sounds.playSolve();
    gameState.flags.artifactSecured = true;
    gameState.stats.completed = true;
    gameState.addItem({ id: 'chronos_oculus', name: 'The Chronos Oculus', desc: 'The fabled celestial astrolabe.' });
    this.triggerVictoryScreen();
  }

  transitionZone(newZoneId, spawn) {
    const fade = document.getElementById('screen-fade');
    fade.classList.remove('hidden');
    fade.style.opacity = '1';

    sounds.playDoorUnlock();

    setTimeout(() => {
      gameState.currentZone = newZoneId;
      gameState.player.x = spawn.x;
      gameState.player.y = spawn.y;
      gameState.player.dir = spawn.dir;
      this.loadZone(newZoneId);

      fade.style.opacity = '0';
      setTimeout(() => fade.classList.add('hidden'), 400);
    }, 400);
  }

  // --- MODAL HELPERS ---
  openModal(renderFn) {
    this.engine.inModal = true;
    this.modalContent.innerHTML = '';
    renderFn(this.modalContent);
    this.modalOverlay.classList.remove('hidden');
  }

  closeModal() {
    this.engine.inModal = false;
    this.modalOverlay.classList.add('hidden');
  }

  showDialogue(text) {
    this.dialogueText.textContent = text;
    this.dialogueBox.classList.remove('hidden');
    sounds.playBlip();
  }

  toggleInventoryModal() {
    this.openModal((body) => {
      body.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Lyra's Tactical Satchel</span>
            <h2>Inventory & Artifacts</h2>
          </div>
          <div class="inventory-grid">
            ${gameState.inventory.length === 0 ? '<p>Satchel is empty.</p>' : ''}
            ${gameState.inventory.map(item => `
              <div class="inventory-item-card">
                <div class="inv-icon-box">
                  <div class="item-icon-art item-${item.id}"></div>
                </div>
                <div class="inv-details">
                  <h4>${item.name}</h4>
                  <p>${item.desc || ''}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
  }

  showMenu() {
    this.openModal((body) => {
      body.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Operations</span>
            <h2>Heist Management</h2>
          </div>
          <div class="menu-options">
            <button id="btn-save-game" class="btn-primary">Save Mission Progress</button>
            <button id="btn-reset-game" class="btn-secondary">Restart Heist from Beginning</button>
            <button id="btn-resume" class="btn-secondary">Resume Infiltration</button>
          </div>
        </div>
      `;
      body.querySelector('#btn-save-game').addEventListener('click', () => {
        sounds.playBlip();
        gameState.save();
        alert('Mission progress safely stored in local memory!');
      });
      body.querySelector('#btn-reset-game').addEventListener('click', () => {
        if (confirm('Are you sure you want to restart the heist? All progress will reset.')) {
          gameState.clearSave();
          location.reload();
        }
      });
      body.querySelector('#btn-resume').addEventListener('click', () => {
        this.closeModal();
      });
    });
  }

  // --- VICTORY SCREEN ---
  triggerVictoryScreen() {
    const elapsed = Math.floor((gameState.stats.elapsedTime + (Date.now() - gameState.stats.startTime)) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}m ${secs}s`;

    // Rank calculation
    let rank = 'S';
    if (gameState.stats.hintsUsed > 3 || elapsed > 900) rank = 'A';
    if (gameState.stats.hintsUsed > 6 || elapsed > 1500) rank = 'B';

    this.openModal((body) => {
      body.innerHTML = `
        <div class="victory-screen">
          <div class="victory-header">
            <span class="victory-tag">HEIST ACCOMPLISHED</span>
            <h1>THE CHRONOS OCULUS SECURED</h1>
            <p>Lyra Vance slips into the midnight shadows before Baron Von Klaus's alarms can trigger.</p>
          </div>

          <div class="artifact-showcase">
            <div class="artifact-spin-glow"></div>
            <div class="artifact-title">The Celestial Astrolabe of Alexandria</div>
          </div>

          <div class="mission-dossier">
            <div class="dossier-stat">
              <span class="dossier-label">Operative Rank:</span>
              <span class="dossier-val rank-${rank.toLowerCase()}">RANK ${rank} (Phantom Master)</span>
            </div>
            <div class="dossier-stat">
              <span class="dossier-label">Mission Time:</span>
              <span class="dossier-val">${timeStr}</span>
            </div>
            <div class="dossier-stat">
              <span class="dossier-label">Olympiad Puzzles Deciphered:</span>
              <span class="dossier-val">6 / 6 (100%)</span>
            </div>
            <div class="dossier-stat">
              <span class="dossier-label">Hints Consulted:</span>
              <span class="dossier-val">${gameState.stats.hintsUsed}</span>
            </div>
            <div class="dossier-stat">
              <span class="dossier-label">Forensic Clues Logged:</span>
              <span class="dossier-val">${gameState.clues.length}</span>
            </div>
          </div>

          <div class="victory-actions">
            <button id="btn-play-again" class="btn-primary">Replay Heist</button>
          </div>
        </div>
      `;

      body.querySelector('#btn-play-again').addEventListener('click', () => {
        gameState.clearSave();
        location.reload();
      });
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
