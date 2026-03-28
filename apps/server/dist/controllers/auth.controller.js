import { authService } from '../services/auth.service';
export const authController = {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.signup(name, email, password);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    async me(req, res) {
        try {
            const user = await authService.me(req.user.userId);
            res.json(user);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
};
