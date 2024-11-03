import WebCam from "./components/WebCam";
import DocsChat from "./components/DocsChat";

const App = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
      <WebCam />
      <DocsChat />
    </div>
  );
};

export default App;
