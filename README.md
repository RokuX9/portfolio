# Interactive 3D Portfolio Experience

A fully interactive, first-person 3D portfolio designed to showcase projects and skills in an immersive, non-euclidean virtual museum. Built from scratch with **Three.js**, this portfolio goes beyond traditional web design by utilizing spatial navigation and seamless portal mechanics.

## Features

- **Non-Euclidean Portals:** Seamless, recursive portals that connect physically disjointed rooms, allowing the player to look and walk seamlessly between different areas of the portfolio without loading screens. Uses custom WebGL render targets and oblique near-plane clipping algorithms for flawless continuity.
- **Custom First-Person Controller:** A responsive, physics-based character controller built from the ground up for the browser. Supports WASD movement, pointer-lock mouse look, jumping, and precise collision detection against the environment geometry.
- **Interactive 3D Pedestals:** Projects and links are represented by interactive 3D models floating on pedestals. Players can interact with these artifacts to visit live demos or GitHub repositories.
- **Dynamic Typography Engine:** Custom canvas-based texture generation that parses markdown-style text, handles word wrapping, and displays perfectly crisp typography in 3D space without alpha-blending artifacts.
- **Seamless Loading Architecture:** A custom loading manager gracefully handles heavy 4K textures and GLTF models, presenting the user with a sleek UI progress bar that fades away the moment the 3D scene is fully initialized.
- **Responsive UI & Mobile Support:** Automatically detects device orientation and gracefully handles touch interactions, pointer-locking, and window resizing for a consistent experience across desktop and mobile.

## Tech Stack

- **Three.js** - Core 3D rendering engine, scene graph, and math utilities
- **Vite** - High-performance front-end build tool and development server
- **JavaScript (ES6+)** - Core application logic, controller physics, and shader modifications
- **GLSL** - Custom fragment and vertex shaders for the recursive portal rendering pipeline

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd portfolio
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled assets will be output to the `dist/` directory, ready to be deployed to any static hosting service.

## Architecture Highlights

- **Portals (`Portal.js`):** Implements recursive rendering using `WebGLRenderTarget`. It synchronizes a virtual camera with the main player camera and utilizes Eric Lengyel's oblique clipping plane technique to prevent objects behind the portal from clipping through.
- **Player Physics (`PlayerController.js`):** Implements AABB (Axis-Aligned Bounding Box) collision detection against scene geometry, managing velocity, gravity, and portal teleportation math.
- **Dynamic Geometry (`Room.js`):** Procedurally generates the museum rooms using overlapping solid geometry to completely eliminate WebGL floating-point edge-cracking and Z-fighting artifacts.
