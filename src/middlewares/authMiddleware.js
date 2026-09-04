const jwt = require('jsonwebtoken');
const autenticar = (req, res, next) => {
try {
 const authorization =
 req.headers.authorization;
 if (!authorization) {
 return res.status(401).json({
 mensagem: 'Token não informado'
 });
 }
 const partes = authorization.split(' ');
 if (partes.length !== 2) {
 return res.status(401).json({
 mensagem: 'Formato do token inválido'
 });
 }
 const [tipo, token] = partes;
 if (tipo !== 'Bearer') {
 return res.status(401).json({
 mensagem: 'Token deve utilizar Bearer'
 });
 }
 const dados = jwt.verify(
 token,
 process.env.JWT_SECRET
 );
 req.usuario = dados;
 next();
} catch (error) {
 return res.status(401).json({
 mensagem: 'Token inválido ou expirado'
 });
}
};
const autorizar = (...perfisPermitidos) => {
return (req, res, next) => {
 if (!req.usuario) {
 return res.status(401).json({
 mensagem: 'Usuário não autenticado'
 });
 }
 if (!perfisPermitidos.includes(req.usuario.perfil)) {
 return res.status(403).json({
 mensagem: 'Usuário não possui permissão'
 });
 }
 next();
};
};
module.exports = {
autenticar,
autorizar
};
