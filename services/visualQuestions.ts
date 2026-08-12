import { Question, Subject } from "../types";

/** Offline visual questions designed to exercise the image-question path. */
export const visualQuestionsBySubject: Partial<Record<Subject, Question[]>> = {
  [Subject.PHYSICS]: [
    {
      id: "visual_physics_vector_components",
      text: "The diagram shows a force F resolved into horizontal and vertical components. Which expression gives the horizontal component?",
      imageUrl: "/question-assets/physics-vector.svg",
      imageAlt: "A force vector F at angle theta with horizontal component F cos theta and vertical component Fy.",
      options: ["F sin θ", "F cos θ", "F tan θ", "F / cos θ"],
      correctOptionIndex: 1,
      explanation: "The angle θ is measured between the force vector and the horizontal axis. In the right-angled triangle formed by the two components, the horizontal component is adjacent to θ, while F is the hypotenuse. Therefore cos θ = Fₓ/F, so Fₓ = F cos θ. The vertical component is F sin θ, which is why option A is not correct; tan θ gives a ratio, not a component by itself.",
    },
    {
      id: "visual_physics_vector_vertical",
      text: "In the diagram, which statement correctly describes the vertical component of the force?",
      imageUrl: "/question-assets/physics-vector.svg",
      imageAlt: "A force vector F at angle theta with horizontal and vertical components.",
      options: ["Fᵧ = F sin θ", "Fᵧ = F cos θ", "Fᵧ = F tan θ", "Fᵧ = F + θ"],
      correctOptionIndex: 0,
      explanation: "The vertical component is opposite the angle θ in the component triangle. By the definition of sine, sin θ = opposite/hypotenuse = Fᵧ/F. Multiplying through by F gives Fᵧ = F sin θ. The cosine expression belongs to the adjacent horizontal component, and tan θ is only the ratio Fᵧ/Fₓ.",
    },
  ],
  [Subject.BIOLOGY]: [
    {
      id: "visual_biology_plant_cell",
      text: "In the plant-cell diagram, which labelled structure is primarily responsible for capturing light energy for photosynthesis?",
      imageUrl: "/question-assets/biology-cell.svg",
      imageAlt: "A simplified plant cell showing the cell wall, vacuole, nucleus, and chloroplasts.",
      options: ["The nucleus", "The vacuole", "The chloroplast", "The cell wall"],
      correctOptionIndex: 2,
      explanation: "Chloroplasts contain chlorophyll, the green pigment that absorbs light energy and starts the light-dependent reactions of photosynthesis. The nucleus stores genetic material, the large vacuole helps maintain turgor and stores cell sap, and the cell wall provides rigidity. Thus the chloroplast is the organelle directly associated with trapping light energy.",
    },
    {
      id: "visual_biology_plant_cell_turgor",
      text: "Which structure shown in the diagram helps a plant cell maintain turgor pressure when filled with water?",
      imageUrl: "/question-assets/biology-cell.svg",
      imageAlt: "A plant cell diagram with a large central vacuole.",
      options: ["The central vacuole", "The chloroplast", "The nucleolus", "The ribosome"],
      correctOptionIndex: 0,
      explanation: "The large central vacuole stores cell sap and absorbs water. As it fills, it presses the cytoplasm against the cell wall, producing turgor pressure that keeps the plant tissue firm. Chloroplasts carry out photosynthesis, while the nucleolus and ribosomes are involved mainly in ribosome production and protein synthesis rather than maintaining cell pressure.",
    },
  ],
  [Subject.GEOGRAPHY]: [
    {
      id: "visual_geography_contour_steep",
      text: "On the contour map, which part represents the steepest slope?",
      imageUrl: "/question-assets/contour-map.svg",
      imageAlt: "A contour map with close contour lines on one side and widely spaced lines on the other.",
      options: ["The area with the closest contour lines", "The area with the widest contour lines", "The map margin", "The area with no contour line"],
      correctOptionIndex: 0,
      explanation: "Contour lines join places of equal elevation. Where they are close together, elevation changes rapidly over a short horizontal distance, indicating a steep slope. Widely spaced lines show a gentler slope because the same elevation change occurs over a greater distance. The spacing, rather than the presence of a map margin, is the key evidence.",
    },
    {
      id: "visual_geography_contour_gentle",
      text: "What does the widely spaced contour pattern on the diagram indicate?",
      imageUrl: "/question-assets/contour-map.svg",
      imageAlt: "A contour map showing widely spaced contour lines on a gentle slope.",
      options: ["A vertical cliff", "A gentle slope", "A deep ocean trench", "A river channel by itself"],
      correctOptionIndex: 1,
      explanation: "Widely spaced contours indicate that elevation changes slowly over horizontal distance, which is the definition of a gentle slope. A vertical cliff would have contours almost touching or merging. A contour map does not identify a deep trench or a river channel from spacing alone; those interpretations require additional symbols and context.",
    },
  ],
};
