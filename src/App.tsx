import WebCam from "./components/WebCam";
import DocsChat from "./components/DocsChat";

const App = () => {
  const h = import.meta.env.VITE_API_URL;
  console.log({ h });
  return (
    <>
      <WebCam />
      <DocsChat />
    </>
  );
};

export default App;
