import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import "./App.css";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { QuoteForm } from "./pages/QuoteForm";
import { QuoteResults } from "./pages/QuoteResults";
import { Services } from "./pages/Services";

function App() {
  const [theme, setTheme] = useState("light");

  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  const navigate = useNavigate();

  return (
    <ThemeProvider theme={darkTheme}>
      <Paper sx={{ minHeight: "100vh" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginRight: 3,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <BeachAccessIcon
                sx={{
                  fontSize: 32,
                  marginRight: 0.5,
                  color: theme === "light" ? "#1976d2" : "#90caf9",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: theme === "light" ? "#1976d2" : "#90caf9",
                }}
              >
                Assured
              </Typography>
            </Box>

            <Button onClick={() => navigate("/")} color="inherit">
              Home
            </Button>
            <Button onClick={() => navigate("/Dashboard")} color="inherit">
              Dashboard
            </Button>
            <Button onClick={() => navigate("/Services")} color="inherit">
              Services
            </Button>

            <Button
              sx={{ marginLeft: "auto" }}
              color="inherit"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              startIcon={
                theme === "light" ? <DarkModeIcon /> : <LightModeIcon />
              }
            >
              {theme === "light" ? "dark" : "light"}
            </Button>
          </Toolbar>
        </Box>

        <div className="App">
          <Routes>
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/quote-form" element={<QuoteForm />} />
            <Route path="/QuoteResults" element={<QuoteResults />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
