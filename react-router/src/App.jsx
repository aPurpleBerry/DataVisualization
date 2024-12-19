import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';
import TxNode from './TxNode';

function App() {
  return (
    <>
      <nav>
        {/* 导航链接 */}
        <Link to="/">DemoTest</Link> | <Link to="/about">ProjectGraph</Link> | <Link to="/txnode">TxNode</Link>
      </nav>

      {/* 路由规则 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/txnode" element={<TxNode />} />
      </Routes>
    </>
  );
}

export default App;
