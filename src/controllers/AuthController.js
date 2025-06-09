const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            if (!(await user.checkPassword(password))) {
                return res.status(401).json({ error: 'Senha incorreta' });
            }

            const { id, role } = user;

            return res.json({
                user: {
                    id,
                    email,
                    role,
                },
                token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
                    expiresIn: '7d',
                }),
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = new AuthController(); 