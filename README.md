🌐 3D Hidden Surface Removal & Camera Control

This project implements a 3D rendering system using pure TypeScript and the HTML Canvas API inside an Angular standalone component. It focuses on correct object visibility through a hidden surface removal algorithm and provides full real-time camera navigation.

Key Features

Hidden Surface Removal: Custom algorithm ensures proper occlusion handling so objects blocked by others are not rendered.

Custom 3D Pipeline: All transformations, rendering logic, and visibility calculations are implemented manually without external 3D engines (e.g., Three.js).

Matrix Algebra: Uses 4x4 rotation and transformation matrices to manage camera orientation and world-space movement.

Real-time Controls:
Arrow keys — camera translation
A, S, D, E, W, Q — camera rotation
Z, X — zoom

Scene: Renders a multi-object 3D environment designed to demonstrate depth, occlusion, and spatial navigation.