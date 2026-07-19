import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Recognize from "./pages/Recognize";
import Learn from "./pages/Learn";
import Understand from "./pages/Understand";
import About from "./pages/About";
import Lesson from "./pages/Lesson";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recognize" element={<Recognize />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/:levelId/:lessonId" element={<Lesson />} />
        <Route path="understand" element={<Understand />} />
        <Route path="about" element={<About />} />
        <Route path="login" element={<Login />} />
      </Route>
    </Routes>
  );
}
