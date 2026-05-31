# JARV-S 🧠

An advanced, interactive AI assistant featuring 3D visual feedback, hand gesture recognition, and voice interaction. JARV-S is designed to provide a highly immersive and futuristic user experience, combining state-of-the-art web technologies and powerful AI models.

## ✨ Features

- **3D Brain Visualization**: An interactive, dynamic 3D brain utilizing React Three Fiber, featuring organic particle movements, bloom effects, and responsive states.
- **Hand Gesture Control**: Touchless interface interaction using real-time computer vision and MediaPipe hand tracking.
- **Voice Interface**: Natural voice chats enabled by OpenAI Whisper (Speech-to-Text) and Edge TTS (Text-to-Speech).
- **Dual AI Engine Support**: Flexible LLM backends. Run entirely locally for privacy utilizing **Ollama**, or leverage high-speed cloud models via **Groq**.
- **Contextual Memory System**: Persistent conversation memory database allows the AI to remember past interactions and provide context-aware responses.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16, React 19
- **3D & Graphics**: Three.js, React Three Fiber, React Three Drei, Postprocessing
- **Styling & Animations**: Tailwind CSS, Framer Motion
- **Computer Vision**: `@mediapipe/tasks-vision`
- **State Management**: Zustand

### Backend
- **Framework**: FastAPI (Python), Uvicorn
- **AI / ML**: OpenAI Whisper, Edge-TTS
- **LLM Integration**: Ollama (Local), Groq (Cloud)
- **Data Validation**: Pydantic

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- Python (3.10 or higher)
- [Ollama](https://ollama.com/) (Optional, required only if you want to run models locally)

### 1. Clone the repository
```bash
git clone https://github.com/efesahinn42-rgb/JARVIS.git
cd JARVIS
```

### 2. Backend Setup
Navigate to the backend directory and set up your Python environment:

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```
*The backend server will start on `http://localhost:8000`.*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install the Node dependencies:

```bash
cd frontend
npm install

# Start the Next.js development server
npm run dev
```
*The frontend application will be available at `http://localhost:3000`.*

### 4. Environment Variables
Make sure to configure your environment variables. Copy the `.env.example` file to `.env` in the root directory (or respective frontend/backend directories depending on your setup) and populate it with your keys.

```bash
cp .env.example .env
```
*(You will need a Groq API Key if you plan to use Groq as your LLM provider).*

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before making a contribution. Feel free to check the [issues page](https://github.com/efesahinn42-rgb/JARVIS/issues).

## 🛡️ Security
If you discover any security related issues, please refer to our [Security Policy](SECURITY.md) for reporting guidelines.

## 📝 License
This project is licensed under the [MIT License](LICENSE).
