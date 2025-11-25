# AI4S Smart HR Application

This repository is structured as a monorepo with a separate `frontend` and `backend` for easy cloud deployment.

## Project Structure

- **/frontend**: Contains the complete React application source code. This is the code that will be deployed to a static hosting service like Vercel.
- **/backend**: Contains the Node.js server code. This is ready to be deployed to a service like Render.

---

### **IMPORTANT CLEANUP STEP**

Your repository currently contains duplicate files at the root level (e.g., `App.tsx`, `components/`, etc.). These are from the old project structure.

**You must delete all the old application source files and folders from the root of your project.**

The only items that should remain at the root level are:
- `frontend/` (directory)
- `backend/` (directory)
- `.gitignore`
- `README.md` (this file)

This will ensure your project is clean and ready for deployment.
