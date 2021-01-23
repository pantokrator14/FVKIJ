/**
 * type: Permission
 * Muestra los permisos del usuario para cada rol
 * 
 * @property {Boolean} admin - Es un administrador
 * @property {Boolean} user - Puede acceder como usuario
 * @property {Boolean} dojo - Puede acceder como dojo
 * 
 * @example
 * let user = new User();
 * 
 * let userPermissions = new Permission(user);
 * 
 * // puedes agregárselo directamente al usuario
 * 
 * user.permissions = new Permission(user);
 */
class Permission {
    constructor(user) {
        this.admin = Boolean(user.admin);
        this.user = true;
        this.dojo = Boolean(user.dojo.canEdit);
    }
}

module.exports = Permission;