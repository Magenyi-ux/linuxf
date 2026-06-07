export const physicsStarterData = [
  {
    name: "newton_laws",
    subject: "Physics",
    coverage: 100,
    units: [
      { type: "definition", content: "Newton's laws of motion are three physical laws that, together, laid the foundation for classical mechanics. They describe the relationship between a body and the forces acting upon it, and its motion in response to those forces." },
      { type: "law", content: "Newton's First Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force." },
      { type: "law", content: "Newton's Second Law (F=ma): The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object." },
      { type: "law", content: "Newton's Third Law (Action/Reaction): For every action, there is an equal and opposite reaction." },
      { type: "formula", content: "F = ma", metadata: "F = Net Force (Newtons), m = Mass (kg), a = Acceleration (m/s²)" },
      { type: "example", content: "Calculate the force needed to accelerate a 5kg mass at 2m/s².", metadata: "Solution: F = 5kg * 2m/s² = 10N" },
      { type: "relationship", content: "Momentum, Friction, Circular Motion" }
    ]
  },
  {
    name: "optics",
    subject: "Physics",
    coverage: 95,
    units: [
      { type: "definition", content: "Optics is the branch of physics that studies the behaviour and properties of light, including its interactions with matter and the construction of instruments that use or detect it." },
      { type: "law", content: "Law of Reflection: The angle of incidence is equal to the angle of reflection (θi = θr)." },
      { type: "law", content: "Snell's Law: n₁sinθ₁ = n₂sinθ₂" },
      { type: "formula", content: "1/f = 1/v + 1/u", metadata: "Mirror/Lens formula: f = focal length, v = image distance, u = object distance" },
      { type: "formula", content: "m = -v/u = h_i/h_o", metadata: "Magnification: m = magnification, h_i = image height, h_o = object height" },
      { type: "diagram", content: "Ray diagram of a convex lens forming a real image." },
      { type: "relationship", content: "Electromagnetic Waves, Refraction, Interference" }
    ]
  },
  {
    name: "electricity",
    subject: "Physics",
    coverage: 90,
    units: [
      { type: "definition", content: "Electricity is the set of physical phenomena associated with the presence and motion of matter that has a property of electric charge." },
      { type: "law", content: "Ohm's Law: The current through a conductor between two points is directly proportional to the voltage across the two points (V = IR)." },
      { type: "formula", content: "V = IR", metadata: "V = Voltage (Volts), I = Current (Amperes), R = Resistance (Ohms)" },
      { type: "formula", content: "P = IV = I²R = V²/R", metadata: "Electric Power (Watts)" },
      { type: "example", content: "A 12V battery is connected to a 4Ω resistor. Calculate the current.", metadata: "Solution: I = V/R = 12/4 = 3A" },
      { type: "relationship", content: "Magnetism, Electronics, Thermodynamics" }
    ]
  },
  {
    name: "thermodynamics",
    subject: "Physics",
    coverage: 85,
    units: [
      { type: "definition", content: "Thermodynamics is the branch of physics that deals with heat, work, and temperature, and their relation to energy, radiation, and physical properties of matter." },
      { type: "law", content: "First Law of Thermodynamics: Energy cannot be created or destroyed in an isolated system." },
      { type: "law", content: "Second Law of Thermodynamics: The entropy of any isolated system always increases." },
      { type: "formula", content: "ΔU = Q - W", metadata: "ΔU = Change in internal energy, Q = Heat added, W = Work done by the system" },
      { type: "relationship", content: "Heat capacity, Ideal gas law, Entropy" }
    ]
  },
  {
    name: "waves",
    subject: "Physics",
    coverage: 100,
    units: [
      { type: "definition", content: "A wave is a disturbance that transfers energy through matter or space, with little or no associated mass transport." },
      { type: "formula", content: "v = fλ", metadata: "v = Wave speed, f = Frequency, λ = Wavelength" },
      { type: "formula", content: "T = 1/f", metadata: "T = Period, f = Frequency" },
      { type: "relationship", content: "Sound, Light, Doppler Effect" }
    ]
  },
  {
    name: "quantum_mechanics",
    subject: "Physics",
    coverage: 70,
    units: [
      { type: "definition", content: "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles." },
      { type: "formula", content: "E = hf", metadata: "E = Energy of a photon, h = Planck's constant, f = Frequency" },
      { type: "law", content: "Heisenberg Uncertainty Principle: It is impossible to know both the exact position and momentum of a particle simultaneously." }
    ]
  },
  {
    name: "relativity",
    subject: "Physics",
    coverage: 75,
    units: [
      { type: "definition", content: "Relativity encompasses two theories by Albert Einstein: special relativity and general relativity, which revolutionized our understanding of space, time, and gravity." },
      { type: "formula", content: "E = mc²", metadata: "E = Energy, m = Mass, c = Speed of light" },
      { type: "law", content: "Special Relativity: The laws of physics are the same for all observers moving at a constant velocity." }
    ]
  },
  {
    name: "radioactivity",
    subject: "Physics",
    coverage: 90,
    units: [
      { type: "definition", content: "Radioactivity is the process by which an unstable atomic nucleus loses energy by radiation." },
      { type: "formula", content: "N = N₀e^(-λt)", metadata: "Radioactive decay law: N = remaining nuclei, N₀ = initial nuclei, λ = decay constant, t = time" },
      { type: "formula", content: "T½ = ln(2)/λ", metadata: "Half-life formula" }
    ]
  },
  {
    name: "circular_motion",
    subject: "Physics",
    coverage: 95,
    units: [
      { type: "definition", content: "Circular motion is a movement of an object along the circumference of a circle or rotation along a circular path." },
      { type: "formula", content: "a_c = v²/r", metadata: "Centripetal acceleration" },
      { type: "formula", content: "F_c = mv²/r", metadata: "Centripetal force" }
    ]
  },
  {
    name: "gravitation",
    subject: "Physics",
    coverage: 100,
    units: [
      { type: "definition", content: "Gravity is a natural phenomenon by which all things with mass or energy are brought toward one another." },
      { type: "law", content: "Newton's Law of Universal Gravitation: Every point mass attracts every other point mass by a force acting along the line intersecting both points." },
      { type: "formula", content: "F = G(m₁m₂)/r²", metadata: "Newton's gravitational constant G ≈ 6.674 × 10⁻¹¹ N⋅m²/kg²" }
    ]
  },
  {
    name: "work_energy_power",
    subject: "Physics",
    coverage: 100,
    units: [
      { type: "formula", content: "W = Fd cosθ", metadata: "Work done" },
      { type: "formula", content: "KE = ½mv²", metadata: "Kinetic Energy" },
      { type: "formula", content: "PE = mgh", metadata: "Potential Energy" },
      { type: "formula", content: "P = W/t", metadata: "Power" }
    ]
  },
  {
    name: "momentum",
    subject: "Physics",
    coverage: 95,
    units: [
      { type: "definition", content: "Momentum is the product of the mass and velocity of an object." },
      { type: "formula", content: "p = mv", metadata: "Linear momentum" },
      { type: "law", content: "Conservation of Momentum: The total momentum of a closed system remains constant." }
    ]
  },
  {
    name: "fluids",
    subject: "Physics",
    coverage: 80,
    units: [
      { type: "law", content: "Archimedes' Principle: An object immersed in a fluid is buoyed up by a force equal to the weight of the fluid it displaces." },
      { type: "formula", content: "P = ρgh", metadata: "Fluid pressure" },
      { type: "law", content: "Bernoulli's Principle: As the speed of a moving fluid increases, the pressure within the fluid decreases." }
    ]
  },
  {
    name: "magnetism",
    subject: "Physics",
    coverage: 85,
    units: [
      { type: "definition", content: "Magnetism is a class of physical phenomena that are mediated by magnetic fields." },
      { type: "law", content: "Faraday's Law of Induction: A changing magnetic field will induce an electromotive force (EMF) in a conductor." },
      { type: "law", content: "Lenz's Law: The direction of an induced current is such that it opposes the change that produced it." }
    ]
  },
  {
    name: "simple_harmonic_motion",
    subject: "Physics",
    coverage: 90,
    units: [
      { type: "definition", content: "SHM is a type of periodic motion where the restoring force is directly proportional to the displacement." },
      { type: "formula", content: "T = 2π√(l/g)", metadata: "Period of a simple pendulum" },
      { type: "formula", content: "T = 2π√(m/k)", metadata: "Period of a mass-spring system" }
    ]
  },
  {
    name: "electrostatics",
    subject: "Physics",
    coverage: 90,
    units: [
      { type: "law", content: "Coulomb's Law: The force between two point charges is proportional to the product of the charges and inversely proportional to the square of the distance between them." },
      { type: "formula", content: "F = k(q₁q₂)/r²", metadata: "k ≈ 8.987 × 10⁹ N⋅m²/C²" }
    ]
  },
  {
    name: "gas_laws",
    subject: "Physics",
    coverage: 100,
    units: [
      { type: "law", content: "Boyle's Law: P₁V₁ = P₂V₂ (at constant temperature)" },
      { type: "law", content: "Charles's Law: V₁/T₁ = V₂/T₂ (at constant pressure)" },
      { type: "formula", content: "PV = nRT", metadata: "Ideal Gas Law" }
    ]
  },
  {
    name: "kinematics",
    subject: "Physics",
    coverage: 100,
    units: [
      { type: "formula", content: "v = u + at" },
      { type: "formula", content: "s = ut + ½at²" },
      { type: "formula", content: "v² = u² + 2as" }
    ]
  },
  {
    name: "nuclear_physics",
    subject: "Physics",
    coverage: 80,
    units: [
      { type: "definition", content: "Nuclear physics is the field of physics that studies atomic nuclei and their constituents and interactions." },
      { type: "law", content: "Nuclear Fission: A heavy nucleus splits into smaller nuclei with the release of energy." },
      { type: "law", content: "Nuclear Fusion: Two light nuclei combine to form a heavier nucleus with the release of energy." }
    ]
  },
  {
    name: "electronics",
    subject: "Physics",
    coverage: 75,
    units: [
      { type: "definition", content: "Electronics is the science of controlling electrical energy electrically." },
      { type: "relationship", content: "Semiconductors, Diodes, Transistors, Integrated Circuits" }
    ]
  }
];
