export const homeRoutes = (app) => {
  // simple route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the ECC Backend API.' });
  });
};
