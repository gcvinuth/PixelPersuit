// Olympiad & Logic Deduction Escape Room Puzzle Engines
import { gameState } from './state.js';
import { sounds } from './audio.js';

export class PuzzleManager {
  constructor() {
    this.currentPuzzle = null;
    this.onPuzzleSolved = null;
  }

  // --- PUZZLE 1: THE FOUR CONFIDANTS (KNIGHTS & KNAVES LOGIC) ---
  renderSuspectsPuzzle(container, onComplete) {
    this.currentPuzzle = 'suspects';
    
    // Statements:
    // Butler: "The Guard is a liar."
    // Scribe: "The Butler and the Chemist are both truth-tellers or both liars."
    // Chemist: "If the Butler is telling the truth, then the Scribe is a liar."
    // Guard: "At least one of the Scribe or the Chemist is a liar."
    // Exactly two are truth-tellers, exactly two are liars.
    // Solution: Butler=Liar (F), Scribe=Liar (F), Chemist=Truth (T), Guard=Truth (T)

    const state = gameState.notebookScratchpad.suspects;

    container.innerHTML = `
      <div class="puzzle-card">
        <div class="puzzle-header">
          <span class="puzzle-badge">Logic Deduction • Olympiad Parity</span>
          <h2>The Four Confidants of Baron Von Klaus</h2>
          <p class="puzzle-sub">
            The inscription reads: <em>"Exactly two of us speak the truth; the other two always lie. Deducing our true nature unlocks the secret bureau compartment."</em>
          </p>
        </div>

        <div class="suspects-grid">
          <!-- Butler -->
          <div class="suspect-item" data-id="butler">
            <div class="suspect-avatar butler-art"></div>
            <div class="suspect-info">
              <h3>Lord Butler</h3>
              <blockquote class="speech-bubble">"The Guard is a liar."</blockquote>
              <div class="toggle-group">
                <button class="btn-toggle ${state.butler === 'T' ? 'active-t' : ''}" data-val="T">Truth (T)</button>
                <button class="btn-toggle ${state.butler === 'F' ? 'active-f' : ''}" data-val="F">Liar (F)</button>
              </div>
            </div>
          </div>

          <!-- Scribe -->
          <div class="suspect-item" data-id="scribe">
            <div class="suspect-avatar scribe-art"></div>
            <div class="suspect-info">
              <h3>Master Scribe</h3>
              <blockquote class="speech-bubble">"The Butler and the Chemist are both truth-tellers or both liars."</blockquote>
              <div class="toggle-group">
                <button class="btn-toggle ${state.scribe === 'T' ? 'active-t' : ''}" data-val="T">Truth (T)</button>
                <button class="btn-toggle ${state.scribe === 'F' ? 'active-f' : ''}" data-val="F">Liar (F)</button>
              </div>
            </div>
          </div>

          <!-- Chemist -->
          <div class="suspect-item" data-id="chemist">
            <div class="suspect-avatar chemist-art"></div>
            <div class="suspect-info">
              <h3>Court Chemist</h3>
              <blockquote class="speech-bubble">"If the Butler is telling the truth, then the Scribe is a liar."</blockquote>
              <div class="toggle-group">
                <button class="btn-toggle ${state.chemist === 'T' ? 'active-t' : ''}" data-val="T">Truth (T)</button>
                <button class="btn-toggle ${state.chemist === 'F' ? 'active-f' : ''}" data-val="F">Liar (F)</button>
              </div>
            </div>
          </div>

          <!-- Guard -->
          <div class="suspect-item" data-id="guard">
            <div class="suspect-avatar guard-art"></div>
            <div class="suspect-info">
              <h3>Chief Guard</h3>
              <blockquote class="speech-bubble">"At least one of the Scribe or the Chemist is a liar."</blockquote>
              <div class="toggle-group">
                <button class="btn-toggle ${state.guard === 'T' ? 'active-t' : ''}" data-val="T">Truth (T)</button>
                <button class="btn-toggle ${state.guard === 'F' ? 'active-f' : ''}" data-val="F">Liar (F)</button>
              </div>
            </div>
          </div>
        </div>

        <div class="puzzle-status-bar" id="suspects-feedback">
          Assign each confidant and verify your logical deduction.
        </div>

        <div class="puzzle-actions">
          <button id="btn-verify-suspects" class="btn-primary">Verify Logical Deduction</button>
          <button id="btn-hint-suspects" class="btn-secondary">Examine Scratchpad Hint</button>
        </div>
      </div>
    `;

    // Button event handlers
    const suspectItems = container.querySelectorAll('.suspect-item');
    suspectItems.forEach(item => {
      const id = item.dataset.id;
      const buttons = item.querySelectorAll('.btn-toggle');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          sounds.playBlip();
          buttons.forEach(b => b.classList.remove('active-t', 'active-f'));
          const val = btn.dataset.val;
          btn.classList.add(val === 'T' ? 'active-t' : 'active-f');
          state[id] = val;
          gameState.save();
        });
      });
    });

    const feedback = container.querySelector('#suspects-feedback');
    container.querySelector('#btn-verify-suspects').addEventListener('click', () => {
      const b = state.butler;
      const s = state.scribe;
      const c = state.chemist;
      const g = state.guard;

      if (!b || !s || !c || !g) {
        feedback.textContent = "Incomplete assignment! Please determine Truth or Liar for all 4 confidants.";
        feedback.className = "puzzle-status-bar error";
        sounds.playError();
        return;
      }

      const truthCount = [b, s, c, g].filter(v => v === 'T').length;
      if (truthCount !== 2) {
        feedback.textContent = `Constraint Violated: Exactly 2 must be Truth-Tellers (you currently have ${truthCount}).`;
        feedback.className = "puzzle-status-bar error";
        sounds.playError();
        return;
      }

      // Validating assertions
      // Butler: Guard is Liar -> true if g === 'F'
      const butlerValid = (b === 'T') === (g === 'F');
      // Scribe: Butler and Chemist same -> true if b === c
      const scribeValid = (s === 'T') === (b === c);
      // Chemist: Butler => not Scribe -> if b is 'T' then s is 'F' (material implication: (b !== 'T') || (s === 'F'))
      const chemStmt = (b !== 'T') || (s === 'F');
      const chemValid = (c === 'T') === chemStmt;
      // Guard: At least one of Scribe or Chemist is Liar -> true if s === 'F' || c === 'F'
      const guardStmt = (s === 'F') || (c === 'F');
      const guardValid = (g === 'T') === guardStmt;

      if (butlerValid && scribeValid && chemValid && guardValid && b === 'F' && s === 'F' && c === 'T' && g === 'T') {
        feedback.textContent = "Deduction Verified! The assertions hold without contradiction. Secret drawer unlatched!";
        feedback.className = "puzzle-status-bar success";
        sounds.playSolve();
        gameState.flags.suspectsSolved = true;
        gameState.addClue("Solved Confidants Logic: Butler=F, Scribe=F, Chemist=T, Guard=T. The secret drawer yielded the UV Monocle and 5 Antiquity Relics!");
        
        // Add items
        gameState.addItem({ id: 'uv_monocle', name: 'Ultraviolet Monocle', desc: 'Reveals hidden mathematical inscriptions.' });
        ['relic_ruby', 'relic_emerald', 'relic_sapphire', 'relic_amber', 'relic_amethyst'].forEach(id => {
          const names = {
            relic_ruby: 'Crimson Ruby Relic',
            relic_emerald: 'Verdant Emerald Relic',
            relic_sapphire: 'Azure Sapphire Relic',
            relic_amber: 'Golden Amber Relic',
            relic_amethyst: 'Imperial Amethyst Relic'
          };
          gameState.addItem({ id, name: names[id], desc: 'An ancient relic of precise integer mass.' });
        });

        setTimeout(() => {
          onComplete && onComplete();
        }, 1800);
      } else {
        feedback.textContent = "Logical Contradiction Detected! Re-check if statements match the assigned Truth/Liar values.";
        feedback.className = "puzzle-status-bar error";
        sounds.playError();
      }
    });

    container.querySelector('#btn-hint-suspects').addEventListener('click', () => {
      sounds.playBlip();
      gameState.stats.hintsUsed++;
      feedback.textContent = "Hint: Test Butler first. If Butler were a Truth-teller, Guard is Liar, forcing Scribe and Chemist to have opposite truths. Check Scribe's statement under that case!";
      feedback.className = "puzzle-status-bar info";
    });
  }

  // --- PUZZLE 2: THE 5 BALANCE PEDESTALS (MASS EQUILIBRIUM DEDUCTION) ---
  renderScalesPuzzle(container, onComplete) {
    this.currentPuzzle = 'scales';

    // Mass system:
    // Ruby = 1kg
    // Emerald = 2kg
    // Sapphire = 3kg
    // Amber = 5kg
    // Amethyst = 6kg
    // Order from left to right: Ruby (1), Emerald (2), Sapphire (3), Amber (5), Amethyst (6)
    const relicData = {
      relic_ruby: { name: 'Ruby', mass: 1, color: '#ef4444' },
      relic_emerald: { name: 'Emerald', mass: 2, color: '#10b981' },
      relic_sapphire: { name: 'Sapphire', mass: 3, color: '#3b82f6' },
      relic_amber: { name: 'Amber', mass: 5, color: '#f59e0b' },
      relic_amethyst: { name: 'Amethyst', mass: 6, color: '#a855f7' }
    };

    const slots = gameState.scaleSlots; // array of 5 relic IDs or null
    let scaleLeft = [];
    let scaleRight = [];

    const updateView = () => {
      // Calculate scale balance
      const leftWeight = scaleLeft.reduce((acc, id) => acc + relicData[id].mass, 0);
      const rightWeight = scaleRight.reduce((acc, id) => acc + relicData[id].mass, 0);
      let tiltAngle = 0;
      if (leftWeight > rightWeight) tiltAngle = -12;
      else if (rightWeight > leftWeight) tiltAngle = 12;

      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Discrete Optimization • Mass Equilibria</span>
            <h2>The Five Pedestals of Mass Equilibrium</h2>
            <p class="puzzle-sub">
              Place the five antique relics onto the pedestals in <strong>ascending order of integer mass</strong> (Lightest to Heaviest).
            </p>
          </div>

          <!-- Working Test Scale Bed -->
          <div class="scale-testbed">
            <div class="scale-frame" style="transform: rotate(${tiltAngle}deg)">
              <div class="scale-beam"></div>
              <div class="scale-pan left-pan" id="drop-scale-left">
                <span class="pan-label">Left Pan (${leftWeight}kg)</span>
                <div class="pan-items">
                  ${scaleLeft.map(id => `<div class="relic-chip" style="background:${relicData[id].color}" data-relic="${id}">${relicData[id].name}</div>`).join('')}
                </div>
              </div>
              <div class="scale-pan right-pan" id="drop-scale-right">
                <span class="pan-label">Right Pan (${rightWeight}kg)</span>
                <div class="pan-items">
                  ${scaleRight.map(id => `<div class="relic-chip" style="background:${relicData[id].color}" data-relic="${id}">${relicData[id].name}</div>`).join('')}
                </div>
              </div>
            </div>
            <div class="scale-fulcrum"></div>
            <div class="scale-status-readout">
              ${leftWeight === rightWeight && leftWeight > 0 ? '⚖️ IN PERFECT EQUILIBRIUM' : leftWeight > rightWeight ? '◀ Tilted Left' : rightWeight > leftWeight ? '▶ Tilted Right' : 'Balanced (Empty)'}
            </div>
            <button id="btn-clear-scale" class="btn-small">Empty Scale Pans</button>
          </div>

          <!-- Pedestals: Slot 1 to Slot 5 -->
          <div class="pedestals-container">
            <h3>Five Ascending Pedestals</h3>
            <div class="pedestals-row">
              ${[0, 1, 2, 3, 4].map(idx => `
                <div class="pedestal-slot" data-slot="${idx}">
                  <span class="pedestal-num">#${idx + 1}</span>
                  <div class="pedestal-socket">
                    ${slots[idx] ? `
                      <div class="relic-chip placed" style="background:${relicData[slots[idx]].color}" data-relic="${slots[idx]}">
                        ${relicData[slots[idx]].name}
                      </div>
                    ` : '<span class="socket-empty">Empty</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Inventory Relic Pool -->
          <div class="relics-pool">
            <h4>Available Relics (Tap to test on Scale or place on Pedestal):</h4>
            <div class="relic-chips-list">
              ${Object.keys(relicData).map(id => {
                const isPlaced = slots.includes(id);
                return `
                  <button class="relic-select-btn ${isPlaced ? 'placed' : ''}" data-relic="${id}" style="border-color:${relicData[id].color}">
                    <span class="color-dot" style="background:${relicData[id].color}"></span>
                    ${relicData[id].name} Relic ${isPlaced ? '(Placed)' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="puzzle-status-bar" id="scales-feedback">
            Use the scale to test equilibria: E + R = S, 2R = E, S + E = A, M = A + R.
          </div>

          <div class="puzzle-actions">
            <button id="btn-verify-scales" class="btn-primary">Engage Pedestal Locks</button>
            <button id="btn-hint-scales" class="btn-secondary">Review Baron's Notebook</button>
          </div>
        </div>
      `;

      bindEvents();
    };

    const bindEvents = () => {
      // Clear scale
      container.querySelector('#btn-clear-scale').addEventListener('click', () => {
        sounds.playBlip();
        scaleLeft = [];
        scaleRight = [];
        updateView();
      });

      // Relic selection buttons
      container.querySelectorAll('.relic-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.relic;
          sounds.playBlip();
          // Prompt where to place: Scale Left, Scale Right, or Pedestal
          const choice = prompt(`Where would you like to place the ${relicData[id].name}?\n1 = Scale Left Pan\n2 = Scale Right Pan\n3 = Ascending Pedestal (#1 to #5)\n4 = Remove from Pedestal`, "1");
          if (choice === "1") {
            if (!scaleLeft.includes(id)) scaleLeft.push(id);
            scaleRight = scaleRight.filter(r => r !== id);
          } else if (choice === "2") {
            if (!scaleRight.includes(id)) scaleRight.push(id);
            scaleLeft = scaleLeft.filter(r => r !== id);
          } else if (choice === "3") {
            const slotNum = parseInt(prompt("Enter Pedestal Number (1 to 5):", "1"), 10);
            if (slotNum >= 1 && slotNum <= 5) {
              // Remove if already in another slot
              const existingIdx = slots.indexOf(id);
              if (existingIdx !== -1) slots[existingIdx] = null;
              slots[slotNum - 1] = id;
              gameState.scaleSlots = slots;
              gameState.save();
            }
          } else if (choice === "4") {
            const existingIdx = slots.indexOf(id);
            if (existingIdx !== -1) {
              slots[existingIdx] = null;
              gameState.scaleSlots = slots;
              gameState.save();
            }
          }
          updateView();
        });
      });

      // Pedestal click to remove
      container.querySelectorAll('.pedestal-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          const idx = parseInt(slot.dataset.slot, 10);
          if (slots[idx]) {
            sounds.playBlip();
            slots[idx] = null;
            gameState.scaleSlots = slots;
            gameState.save();
            updateView();
          }
        });
      });

      // Verify button
      container.querySelector('#btn-verify-scales').addEventListener('click', () => {
        const feedback = container.querySelector('#scales-feedback');
        if (slots.some(s => s === null)) {
          feedback.textContent = "All five pedestals must be filled!";
          feedback.className = "puzzle-status-bar error";
          sounds.playError();
          return;
        }

        // Expected ascending order: Ruby (1), Emerald (2), Sapphire (3), Amber (5), Amethyst (6)
        const expected = ['relic_ruby', 'relic_emerald', 'relic_sapphire', 'relic_amber', 'relic_amethyst'];
        const isCorrect = slots.every((s, i) => s === expected[i]);

        if (isCorrect) {
          feedback.textContent = "Equilibrium Achieved! Heavy counterweights retract within the mahogany bookshelf!";
          feedback.className = "puzzle-status-bar success";
          sounds.playSolve();
          gameState.flags.scalesSolved = true;
          gameState.flags.studyDoorOpen = true;
          gameState.addClue("Solved Mass Pedestals: Ruby (1kg) < Emerald (2kg) < Sapphire (3kg) < Amber (5kg) < Amethyst (6kg). Passage to Art Gallery unlocked!");
          setTimeout(() => {
            onComplete && onComplete();
          }, 1800);
        } else {
          feedback.textContent = "Mechanism locked: Masses are not in true ascending order. Test the equations on the balance scales!";
          feedback.className = "puzzle-status-bar error";
          sounds.playError();
        }
      });

      // Hint button
      container.querySelector('#btn-hint-scales').addEventListener('click', () => {
        sounds.playBlip();
        gameState.stats.hintsUsed++;
        const feedback = container.querySelector('#scales-feedback');
        feedback.textContent = "Clue: Since Emerald = 2 Rubies and Sapphire = Emerald + Ruby = 3 Rubies, Amber = 5 Rubies, Amethyst = 6 Rubies. Since all are integers and max <= 8, Ruby MUST be 1kg!";
        feedback.className = "puzzle-status-bar info";
      });
    };

    updateView();
  }

  // --- PUZZLE 3: THE 4 GALLERY PAINTINGS (EULER, FIBONACCI, SYMMETRY, PRISM) ---
  renderPaintingPuzzle(container, paintingId, onComplete) {
    this.currentPuzzle = 'painting_' + paintingId;

    if (paintingId === 'euler') {
      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Graph Theory • Euler Characteristic</span>
            <h2>Masterpiece I: 'The Planar Partition'</h2>
            <p class="puzzle-sub">
              A complex connected planar graph is woven in silver thread. The museum placard reads:
              <br><em>"In any connected planar graph, the topological invariant remains constant: Vertices (V) - Edges (E) + Faces (F) = 2."</em>
            </p>
          </div>

          <div class="painting-visual euler-canvas-wrap">
            <div class="euler-diagram">
              <div class="graph-stats">
                <span class="stat-tag">Vertices (V) = 14</span>
                <span class="stat-tag">Edges (E) = 21</span>
                <span class="stat-tag highlight">Faces (F) = ?</span>
              </div>
              <div class="graph-svg-box">
                <svg viewBox="0 0 200 140" class="pixel-vector-svg">
                  <!-- Planar graph lines -->
                  <polygon points="100,20 170,60 140,120 60,120 30,60" fill="none" stroke="#38bdf8" stroke-width="2"/>
                  <polygon points="100,50 140,75 120,105 80,105 60,75" fill="none" stroke="#22d3ee" stroke-width="2"/>
                  <line x1="100" y1="20" x2="100" y2="50" stroke="#f59e0b" stroke-width="2"/>
                  <line x1="170" y1="60" x2="140" y2="75" stroke="#f59e0b" stroke-width="2"/>
                  <line x1="140" y1="120" x2="120" y2="105" stroke="#f59e0b" stroke-width="2"/>
                  <line x1="60" y1="120" x2="80" y2="105" stroke="#f59e0b" stroke-width="2"/>
                  <line x1="30" y1="60" x2="60" y2="75" stroke="#f59e0b" stroke-width="2"/>
                  <!-- Central diagonals -->
                  <line x1="100" y1="50" x2="120" y2="105" stroke="#818cf8" stroke-width="1.5"/>
                  <line x1="100" y1="50" x2="80" y2="105" stroke="#818cf8" stroke-width="1.5"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="puzzle-input-row">
            <label for="euler-ans">Calculate the number of Faces (F including exterior):</label>
            <input type="number" id="euler-ans" min="1" max="50" placeholder="Enter F">
            <button id="btn-submit-euler" class="btn-primary">Authenticate</button>
          </div>

          <div class="puzzle-status-bar" id="euler-feedback">
            Apply the formula: V - E + F = 2
          </div>
        </div>
      `;

      container.querySelector('#btn-submit-euler').addEventListener('click', () => {
        const val = parseInt(container.querySelector('#euler-ans').value, 10);
        const feedback = container.querySelector('#euler-feedback');
        // V - E + F = 2 => 14 - 21 + F = 2 => -7 + F = 2 => F = 9
        if (val === 9) {
          feedback.textContent = "Correct! F = 9 faces. The gold plaque illuminates!";
          feedback.className = "puzzle-status-bar success";
          sounds.playSolve();
          gameState.flags.paintingsSolved.euler = true;
          gameState.addClue("Masterpiece I solved: Euler's formula V(14) - E(21) + F(9) = 2.");
          setTimeout(() => onComplete && onComplete(), 1500);
        } else {
          feedback.textContent = "Incorrect. Remember: V - E + F = 2. Substitute V=14 and E=21.";
          feedback.className = "puzzle-status-bar error";
          sounds.playError();
        }
      });
    }

    else if (paintingId === 'fibonacci') {
      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Combinatorics • Sequence Invariance</span>
            <h2>Masterpiece II: 'The Golden Recurrence'</h2>
            <p class="puzzle-sub">
              An iridescent canvas depicting logarithmic spirals. Inscribed at the perimeter:
              <br><em>"F(n) = F(n-1) + F(n-2). Discover the 11th harmonic ratio key."</em>
            </p>
          </div>

          <div class="sequence-display">
            <span class="seq-item">1</span>
            <span class="seq-item">1</span>
            <span class="seq-item">2</span>
            <span class="seq-item">3</span>
            <span class="seq-item">5</span>
            <span class="seq-item">8</span>
            <span class="seq-item">13</span>
            <span class="seq-item">21</span>
            <span class="seq-item">34</span>
            <span class="seq-item">55</span>
            <span class="seq-item unknown">? [11th]</span>
          </div>

          <div class="puzzle-input-row">
            <label for="fib-ans">Enter the 11th number in the sequence:</label>
            <input type="number" id="fib-ans" placeholder="Enter term">
            <button id="btn-submit-fib" class="btn-primary">Unlock Rune</button>
          </div>

          <div class="puzzle-status-bar" id="fib-feedback">
            The next term is the sum of the two preceding terms (34 + 55).
          </div>
        </div>
      `;

      container.querySelector('#btn-submit-fib').addEventListener('click', () => {
        const val = parseInt(container.querySelector('#fib-ans').value, 10);
        const feedback = container.querySelector('#fib-feedback');
        // 34 + 55 = 89
        if (val === 89) {
          feedback.textContent = "Harmonic locked! Term 11 = 89. The canvas shifts!";
          feedback.className = "puzzle-status-bar success";
          sounds.playSolve();
          gameState.flags.paintingsSolved.fibonacci = true;
          gameState.addClue("Masterpiece II solved: 11th Fibonacci term is 89.");
          setTimeout(() => onComplete && onComplete(), 1500);
        } else {
          feedback.textContent = "Recurrence mismatch. Calculate 34 + 55.";
          feedback.className = "puzzle-status-bar error";
          sounds.playError();
        }
      });
    }

    else if (paintingId === 'symmetry') {
      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Spatial Reasoning • Matrix Transformation</span>
            <h2>Masterpiece III: 'The Permutation Matrix'</h2>
            <p class="puzzle-sub">
              Each row and column follows a 90° clockwise rotation and alternating color inversion. Choose the missing cell.
            </p>
          </div>

          <div class="matrix-grid-3x3">
            <div class="mat-cell">▲ (Cyan)</div>
            <div class="mat-cell">▶ (Amber)</div>
            <div class="mat-cell">▼ (Cyan)</div>

            <div class="mat-cell">◀ (Amber)</div>
            <div class="mat-cell">▲ (Cyan)</div>
            <div class="mat-cell">▶ (Amber)</div>

            <div class="mat-cell">▼ (Cyan)</div>
            <div class="mat-cell">◀ (Amber)</div>
            <div class="mat-cell target-cell" id="target-choice">?</div>
          </div>

          <div class="matrix-options">
            <button class="mat-opt-btn" data-choice="A">Option A: ▲ (Cyan)</button>
            <button class="mat-opt-btn" data-choice="B">Option B: ▲ (Amber)</button>
            <button class="mat-opt-btn" data-choice="C">Option C: ▶ (Cyan)</button>
            <button class="mat-opt-btn" data-choice="D">Option D: ▼ (Amber)</button>
          </div>

          <div class="puzzle-status-bar" id="mat-feedback">
            Select the correct geometric transformation.
          </div>
        </div>
      `;

      container.querySelectorAll('.mat-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const choice = btn.dataset.choice;
          const feedback = container.querySelector('#mat-feedback');
          // Row 3: ▼ (Cyan), ◀ (Amber). Next 90 deg clockwise rotation from ◀ is ▲.
          // Color alternates: Cyan, Amber, Cyan.
          // Correct choice is Option A: ▲ (Cyan)!
          if (choice === 'A') {
            feedback.textContent = "Symmetry Preserved! Option A (▲ Cyan) completes the transformation.";
            feedback.className = "puzzle-status-bar success";
            sounds.playSolve();
            gameState.flags.paintingsSolved.symmetry = true;
            gameState.addClue("Masterpiece III solved: Permutation matrix 90° rotation completes with ▲ Cyan.");
            setTimeout(() => onComplete && onComplete(), 1500);
          } else {
            feedback.textContent = "Incorrect symmetry. Observe the 90° rotation of the arrow and the alternating colors.";
            feedback.className = "puzzle-status-bar error";
            sounds.playError();
          }
        });
      });
    }

    else if (paintingId === 'prism') {
      let angle = 45;
      const renderPrism = () => {
        container.innerHTML = `
          <div class="puzzle-card">
            <div class="puzzle-header">
              <span class="puzzle-badge">Optics • Anamorphic Projection</span>
              <h2>Masterpiece IV: 'The Anamorphic Diamond'</h2>
              <p class="puzzle-sub">
                Rotate the cylindrical refraction dial so that the refracted light beams converge to create the target angle: <strong>180° (Straight Horizontal Axis)</strong>.
              </p>
            </div>

            <div class="prism-view">
              <div class="prism-circle" style="transform: rotate(${angle}deg)">
                <div class="prism-laser-line"></div>
                <div class="prism-core-gem"></div>
              </div>
              <div class="angle-readout">Current Refraction Angle: <strong>${angle}°</strong></div>
            </div>

            <div class="prism-controls">
              <button id="btn-rot-ccw" class="btn-secondary">⟲ Rotate -45°</button>
              <button id="btn-rot-cw" class="btn-secondary">⟳ Rotate +45°</button>
              <button id="btn-lock-prism" class="btn-primary">Lock Refraction</button>
            </div>

            <div class="puzzle-status-bar" id="prism-feedback">
              Target alignment: 180°
            </div>
          </div>
        `;

        container.querySelector('#btn-rot-ccw').addEventListener('click', () => {
          sounds.playRotate();
          angle = (angle - 45 + 360) % 360;
          renderPrism();
        });
        container.querySelector('#btn-rot-cw').addEventListener('click', () => {
          sounds.playRotate();
          angle = (angle + 45) % 360;
          renderPrism();
        });
        container.querySelector('#btn-lock-prism').addEventListener('click', () => {
          const feedback = container.querySelector('#prism-feedback');
          if (angle === 180) {
            feedback.textContent = "Beam Converged! The hidden compartment yields the Gallery Prism Key!";
            feedback.className = "puzzle-status-bar success";
            sounds.playSolve();
            gameState.flags.paintingsSolved.prism = true;
            gameState.addItem({ id: 'prism_key', name: 'Gallery Prism Key', desc: 'An optical key card forged of synthetic diamond.' });
            gameState.addClue("Masterpiece IV solved: Refraction converged at 180°. Acquired Gallery Prism Key.");
            setTimeout(() => onComplete && onComplete(), 1500);
          } else {
            feedback.textContent = `Beam Misaligned! Current angle is ${angle}°, must be exactly 180°.`;
            feedback.className = "puzzle-status-bar error";
            sounds.playError();
          }
        });
      };
      renderPrism();
    }
  }

  // --- PUZZLE 4: THE GALLERY LASER FLOOR (HAMILTONIAN PATH) ---
  renderLaserFloorPuzzle(container, onComplete) {
    this.currentPuzzle = 'laser_floor';
    
    // 5x5 Grid.
    // Start at (0,0) [Top-Left].
    // Goal at (4,4) [Bottom-Right].
    // Player must visit a set of designated waypoints or walk a connected path touching all safe tiles without stepping on the same tile twice!
    // Let's create an elegant 5x5 grid with some blocked obstacle tiles.
    // Grid configuration:
    // S = Start (0,0)
    // E = End (4,4)
    // X = Blocked / Permanent Laser beam
    // . = Safe stepping tile
    // Path must visit all 16 open tiles!
    const size = 5;
    const blocked = ['1,1', '1,3', '3,1', '3,3']; // 4 blocked pillar emitters
    let path = ['0,0']; // visited tile keys 'r,c'

    const renderGrid = () => {
      const currentPos = path[path.length - 1];
      const [curR, curC] = currentPos.split(',').map(Number);
      const totalSafeTiles = size * size - blocked.length; // 25 - 4 = 21 tiles

      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Graph Theory • Hamiltonian Traversal</span>
            <h2>Gallery Security Laser Floor</h2>
            <p class="puzzle-sub">
              To deactivate the perimeter alarm, step through the 5x5 laser matrix from <strong>START (Top-Left)</strong> to <strong>EXIT (Bottom-Right)</strong>.
              <br>Rules: Move orthogonally (Up, Down, Left, Right). <strong>Visit every single active sensor plate (${totalSafeTiles} plates)</strong> without stepping on your own trail or active red lasers!
            </p>
          </div>

          <div class="laser-matrix-container">
            <div class="laser-matrix-stats">
              <span>Steps Connected: <strong>${path.length} / ${totalSafeTiles}</strong></span>
              <button id="btn-reset-laser" class="btn-small">Reset Path</button>
            </div>

            <div class="laser-matrix-grid">
              ${Array.from({ length: size }).map((_, r) => `
                <div class="laser-matrix-row">
                  ${Array.from({ length: size }).map((_, c) => {
                    const key = `${r},${c}`;
                    const isStart = key === '0,0';
                    const isExit = key === '4,4';
                    const isBlocked = blocked.includes(key);
                    const isVisited = path.includes(key);
                    const isCurrent = key === currentPos;

                    let tileClass = 'laser-tile';
                    let label = '';
                    if (isBlocked) {
                      tileClass += ' blocked';
                      label = '⚡';
                    } else if (isStart) {
                      tileClass += ' start';
                      label = 'S';
                    } else if (isExit) {
                      tileClass += ' exit';
                      label = 'E';
                    }

                    if (isVisited) tileClass += ' visited';
                    if (isCurrent) tileClass += ' current';

                    return `
                      <div class="${tileClass}" data-rc="${key}">
                        <span class="tile-icon">${label}</span>
                        ${isVisited ? `<span class="step-num">${path.indexOf(key) + 1}</span>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="puzzle-status-bar" id="laser-feedback">
            Tap an adjacent unvisited tile to advance your path.
          </div>
        </div>
      `;

      // Event handlers
      container.querySelector('#btn-reset-laser').addEventListener('click', () => {
        sounds.playBlip();
        path = ['0,0'];
        renderGrid();
      });

      container.querySelectorAll('.laser-tile').forEach(tile => {
        tile.addEventListener('click', () => {
          const key = tile.dataset.rc;
          const [r, c] = key.split(',').map(Number);
          const feedback = container.querySelector('#laser-feedback');

          if (blocked.includes(key)) {
            feedback.textContent = "Cannot step into active high-voltage laser emitter!";
            feedback.className = "puzzle-status-bar error";
            sounds.playError();
            return;
          }

          if (path.includes(key)) {
            // Check if clicking previous tile to undo
            if (path.length > 1 && key === path[path.length - 2]) {
              path.pop();
              sounds.playBlip();
              renderGrid();
              return;
            }
            feedback.textContent = "Sensor plate already activated! You cannot cross your own trail.";
            feedback.className = "puzzle-status-bar error";
            sounds.playError();
            return;
          }

          // Must be adjacent (distance 1)
          const dist = Math.abs(r - curR) + Math.abs(c - curC);
          if (dist !== 1) {
            feedback.textContent = "You can only step onto an orthogonally adjacent tile (Up, Down, Left, Right).";
            feedback.className = "puzzle-status-bar error";
            sounds.playError();
            return;
          }

          // Advance
          path.push(key);
          sounds.playStep();

          // Check win condition
          if (key === '4,4') {
            if (path.length === totalSafeTiles) {
              renderGrid();
              const fb = container.querySelector('#laser-feedback');
              fb.textContent = "Hamiltonian Path Complete! Security lasers offline. Vault blast doors powered!";
              fb.className = "puzzle-status-bar success";
              sounds.playSolve();
              gameState.flags.laserFloorSolved = true;
              gameState.flags.galleryDoorOpen = true;
              gameState.addClue("Solved Laser Security Floor: Completed Hamiltonian circuit across all 21 sensor plates. Vault entrance clear!");
              setTimeout(() => onComplete && onComplete(), 1800);
              return;
            } else {
              feedback.textContent = `Reached EXIT prematurely (${path.length} of ${totalSafeTiles} plates visited). All plates must be triggered!`;
              feedback.className = "puzzle-status-bar error";
              sounds.playError();
            }
          }

          renderGrid();
        });
      });
    };

    renderGrid();
  }

  // --- PUZZLE 5: THE CONCENTRIC MODULO DIAL (CHINESE REMAINDER THEOREM) ---
  renderModularDialPuzzle(container, onComplete) {
    this.currentPuzzle = 'modular_dial';
    
    // System of Congruences:
    // X = 2 (mod 3)
    // X = 4 (mod 5)
    // X = 1 (mod 7)
    // Smallest positive solution: X = 29
    // (29 = 3*9 + 2; 29 = 5*5 + 4; 29 = 7*4 + 1)
    let currentX = 15;

    const renderDial = () => {
      const rem3 = currentX % 3;
      const rem5 = currentX % 5;
      const rem7 = currentX % 7;

      const target3 = 2;
      const target5 = 4;
      const target7 = 1;

      const ok3 = rem3 === target3;
      const ok5 = rem5 === target5;
      const ok7 = rem7 === target7;

      const allSolved = ok3 && ok5 && ok7;

      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Olympiad Number Theory • Chinese Remainder Theorem</span>
            <h2>Concentric Modular Rotor Lock</h2>
            <p class="puzzle-sub">
              Align the master cogwheel to an integer <strong>X</strong> that satisfies the three ancient modular congruences simultaneously:
            </p>
          </div>

          <div class="concentric-dial-display">
            <!-- Concentric graphical rings -->
            <div class="gear-rings-box">
              <div class="gear-ring outer-ring" style="transform: rotate(${rem7 * 51.4}deg)">
                <span class="ring-label">Mod 7</span>
              </div>
              <div class="gear-ring mid-ring" style="transform: rotate(${rem5 * 72}deg)">
                <span class="ring-label">Mod 5</span>
              </div>
              <div class="gear-ring inner-ring" style="transform: rotate(${rem3 * 120}deg)">
                <span class="ring-label">Mod 3</span>
              </div>
              <div class="gear-center-display">
                <span class="val-num">${currentX}</span>
              </div>
            </div>

            <!-- Modulo status bars -->
            <div class="modulo-readouts">
              <div class="mod-row ${ok3 ? 'aligned' : 'misaligned'}">
                <span class="mod-formula">X ≡ ? (mod 3)</span>
                <span class="mod-val">Current: ${rem3} / Target: ${target3}</span>
                <span class="mod-badge">${ok3 ? '✓ LOCKED' : '✗ OFF'}</span>
              </div>
              <div class="mod-row ${ok5 ? 'aligned' : 'misaligned'}">
                <span class="mod-formula">X ≡ ? (mod 5)</span>
                <span class="mod-val">Current: ${rem5} / Target: ${target5}</span>
                <span class="mod-badge">${ok5 ? '✓ LOCKED' : '✗ OFF'}</span>
              </div>
              <div class="mod-row ${ok7 ? 'aligned' : 'misaligned'}">
                <span class="mod-formula">X ≡ ? (mod 7)</span>
                <span class="mod-val">Current: ${rem7} / Target: ${target7}</span>
                <span class="mod-badge">${ok7 ? '✓ LOCKED' : '✗ OFF'}</span>
              </div>
            </div>
          </div>

          <!-- Slider and Steppers -->
          <div class="gear-controls-row">
            <button id="btn-dec-x" class="btn-secondary">-1</button>
            <button id="btn-dec-5x" class="btn-secondary">-5</button>
            <input type="range" id="x-slider" min="1" max="105" value="${currentX}">
            <button id="btn-inc-x" class="btn-secondary">+1</button>
            <button id="btn-inc-5x" class="btn-secondary">+5</button>
          </div>

          <div class="puzzle-status-bar" id="modular-feedback">
            ${allSolved ? 'Harmonic Resonance Achieved! All 3 rotor gears locked.' : 'Adjust X until all 3 modular targets match simultaneously.'}
          </div>

          <div class="puzzle-actions">
            <button id="btn-engage-modular" class="btn-primary" ${!allSolved ? 'disabled' : ''}>Engage Primary Core Power</button>
            <button id="btn-hint-modular" class="btn-secondary">Decipher Inscription</button>
          </div>
        </div>
      `;

      // Slider listener
      const slider = container.querySelector('#x-slider');
      slider.addEventListener('input', (e) => {
        sounds.playGearClick();
        currentX = parseInt(e.target.value, 10);
        renderDial();
      });

      // Buttons
      container.querySelector('#btn-dec-x').addEventListener('click', () => {
        sounds.playGearClick();
        currentX = Math.max(1, currentX - 1);
        renderDial();
      });
      container.querySelector('#btn-inc-x').addEventListener('click', () => {
        sounds.playGearClick();
        currentX = Math.min(105, currentX + 1);
        renderDial();
      });
      container.querySelector('#btn-dec-5x').addEventListener('click', () => {
        sounds.playGearClick();
        currentX = Math.max(1, currentX - 5);
        renderDial();
      });
      container.querySelector('#btn-inc-5x').addEventListener('click', () => {
        sounds.playGearClick();
        currentX = Math.min(105, currentX + 5);
        renderDial();
      });

      // Engage Core
      container.querySelector('#btn-engage-modular').addEventListener('click', () => {
        if (allSolved) {
          sounds.playSolve();
          gameState.flags.modularDialSolved = true;
          gameState.addClue("Solved Concentric Modulo Dial: X = 29 satisfies 29 ≡ 2 (mod 3), 4 (mod 5), 1 (mod 7). Left power conduit online!");
          setTimeout(() => onComplete && onComplete(), 1500);
        }
      });

      // Hint
      container.querySelector('#btn-hint-modular').addEventListener('click', () => {
        sounds.playBlip();
        gameState.stats.hintsUsed++;
        const fb = container.querySelector('#modular-feedback');
        fb.textContent = "Hint: Look at X ≡ 4 (mod 5). Candidate numbers ending in 4 or 9: 4, 9, 14, 19, 24, 29, 34... Test which one leaves remainder 2 when divided by 3, and remainder 1 when divided by 7!";
        fb.className = "puzzle-status-bar info";
      });
    };

    renderDial();
  }

  // --- PUZZLE 6: QUANTUM OPTICS LASER DEFLECTOR (MIRRORS & BEAMS) ---
  renderOpticsPuzzle(container, onComplete) {
    this.currentPuzzle = 'laser_optics';

    // 5x5 Grid with optical elements
    // Emitters:
    // Cyan Emitter at (0, 1), shoots Down
    // Magenta Emitter at (2, 0), shoots Right
    // Targets:
    // Cyan Target at (4, 3)
    // Magenta Target at (4, 1)
    // 4 Mirrors placed at:
    // M1 at (1, 1) - orientations: 0 (/), 1 (\)
    // M2 at (1, 3) - orientations: 0 (/), 1 (\)
    // M3 at (3, 3) - orientations: 0 (/), 1 (\)
    // M4 at (2, 2) - orientations: 0 (/), 1 (\)
    // Player clicks mirrors to rotate them between 45° (/) and 135° (\)

    const mirrors = [
      { r: 1, c: 1, type: 0 }, // 0: '/', 1: '\'
      { r: 1, c: 3, type: 1 },
      { r: 2, c: 2, type: 0 },
      { r: 3, c: 3, type: 0 },
      { r: 3, c: 1, type: 1 }
    ];

    // Simulates ray paths
    const traceRays = () => {
      // Trace Cyan: starts at (0, 1), dir: [1, 0] (down)
      const cyanPath = [{ r: 0, c: 1 }];
      let cr = 0, cc = 1, cdr = 1, cdc = 0;
      let steps = 0;
      while (steps < 20) {
        cr += cdr;
        cc += cdc;
        if (cr < 0 || cr >= 5 || cc < 0 || cc >= 5) break;
        cyanPath.push({ r: cr, c: cc });
        // Check mirror hit
        const m = mirrors.find(m => m.r === cr && m.c === cc);
        if (m) {
          if (m.type === 0) { // '/' mirror: reflects (dr, dc) -> (-dc, -dr)
            const ndr = -cdc;
            const ndc = -cdr;
            cdr = ndr;
            cdc = ndc;
          } else { // '\' mirror: reflects (dr, dc) -> (dc, dr)
            const ndr = cdc;
            const ndc = cdr;
            cdr = ndr;
            cdc = ndc;
          }
        }
        steps++;
      }

      // Trace Magenta: starts at (2, 0), dir: [0, 1] (right)
      const magPath = [{ r: 2, c: 0 }];
      let mr = 2, mc = 0, mdr = 0, mdc = 1;
      steps = 0;
      while (steps < 20) {
        mr += mdr;
        mc += mdc;
        if (mr < 0 || mr >= 5 || mc < 0 || mc >= 5) break;
        magPath.push({ r: mr, c: mc });
        const m = mirrors.find(m => m.r === mr && m.c === mc);
        if (m) {
          if (m.type === 0) { // '/'
            const ndr = -mdc;
            const ndc = -mdr;
            mdr = ndr;
            mdc = ndc;
          } else { // '\'
            const ndr = mdc;
            const ndc = mdr;
            mdr = ndr;
            mdc = ndc;
          }
        }
        steps++;
      }

      const cyanHitsTarget = cyanPath.some(p => p.r === 4 && p.c === 3);
      const magHitsTarget = magPath.some(p => p.r === 4 && p.c === 1);

      return { cyanPath, magPath, cyanHitsTarget, magHitsTarget };
    };

    const renderGrid = () => {
      const { cyanPath, magPath, cyanHitsTarget, magHitsTarget } = traceRays();
      const allActive = cyanHitsTarget && magHitsTarget;

      container.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-badge">Wave Optics • Reflection & Vector Flow</span>
            <h2>Quantum Laser Deflector Matrix</h2>
            <p class="puzzle-sub">
              Rotate the optical prism mirrors (tap to flip orientation between <strong>/</strong> and <strong>\\</strong>) to direct both lasers to their designated photodetectors.
            </p>
          </div>

          <div class="optics-board-container">
            <div class="optics-grid">
              ${Array.from({ length: 5 }).map((_, r) => `
                <div class="optics-row">
                  ${Array.from({ length: 5 }).map((_, c) => {
                    const isCyanEmitter = r === 0 && c === 1;
                    const isMagEmitter = r === 2 && c === 0;
                    const isCyanTarget = r === 4 && c === 3;
                    const isMagTarget = r === 4 && c === 1;
                    const mirror = mirrors.find(m => m.r === r && m.c === c);

                    const hasCyanBeam = cyanPath.some(p => p.r === r && p.c === c);
                    const hasMagBeam = magPath.some(p => p.r === r && p.c === c);

                    let cellClass = 'optics-cell';
                    if (hasCyanBeam) cellClass += ' beam-cyan';
                    if (hasMagBeam) cellClass += ' beam-mag';

                    return `
                      <div class="${cellClass}" data-rc="${r},${c}">
                        ${isCyanEmitter ? '<span class="emitter cyan">▼ C-Emit</span>' : ''}
                        ${isMagEmitter ? '<span class="emitter mag">▶ M-Emit</span>' : ''}
                        ${isCyanTarget ? `<span class="target cyan ${cyanHitsTarget ? 'active' : ''}">🎯 C-Sensor</span>` : ''}
                        ${isMagTarget ? `<span class="target mag ${magHitsTarget ? 'active' : ''}">🎯 M-Sensor</span>` : ''}
                        ${mirror ? `
                          <button class="mirror-btn ${mirror.type === 0 ? 'slash' : 'backslash'}">
                            <span class="mirror-symbol">${mirror.type === 0 ? '╱' : '╲'}</span>
                          </button>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="puzzle-status-bar" id="optics-feedback">
            ${allActive ? 'Sensors Energized! Secondary power circuit coupled.' : 'Align mirrors to illuminate both Cyan (C-Sensor) and Magenta (M-Sensor).'}
          </div>

          <div class="puzzle-actions">
            <button id="btn-engage-optics" class="btn-primary" ${!allActive ? 'disabled' : ''}>Disengage Containment Field</button>
            <button id="btn-hint-optics" class="btn-secondary">Optics Guidance</button>
          </div>
        </div>
      `;

      // Event handlers for mirrors
      container.querySelectorAll('.mirror-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cell = btn.closest('.optics-cell');
          const [r, c] = cell.dataset.rc.split(',').map(Number);
          const mirror = mirrors.find(m => m.r === r && m.c === c);
          if (mirror) {
            sounds.playRotate();
            mirror.type = mirror.type === 0 ? 1 : 0;
            renderGrid();
          }
        });
      });

      container.querySelector('#btn-engage-optics').addEventListener('click', () => {
        if (allActive) {
          sounds.playSolve();
          gameState.flags.laserOpticsSolved = true;
          gameState.addClue("Solved Quantum Optics Matrix: Both photon beams locked into detectors. Vault Forcefield collapsed!");
          setTimeout(() => onComplete && onComplete(), 1500);
        }
      });

      container.querySelector('#btn-hint-optics').addEventListener('click', () => {
        sounds.playBlip();
        gameState.stats.hintsUsed++;
        const fb = container.querySelector('#optics-feedback');
        fb.textContent = "Hint: Trace Magenta first. From (2,0) going Right, it needs to hit mirror at (2,2) and turn Down toward the sensor at (4,1). Check the mirror at (3,1)!";
        fb.className = "puzzle-status-bar info";
      });
    };

    renderGrid();
  }
}

export const puzzles = new PuzzleManager();
