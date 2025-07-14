const sql = require('mssql');
const dbConfig = require('C:/Users/Daniel/play/config/db_config.js');

class Database2 {
  static async conectar() {
    await sql.connect(dbConfig);
  }

  static async desconectar() {
    await sql.close();
  }

  static async buscarTokenMaisRecentePorIdentificadorETipo(identificadorPremiado, tipo) {
    try {
      await this.conectar();
      const result = await sql.query`
        SELECT TOP 1 * FROM TokenApp
        WHERE IdentificadorPremiado = ${identificadorPremiado}
          AND Tipo = ${tipo}
        ORDER BY DataEmissao DESC
      `;
      await this.desconectar();
      return result.recordset[0];
    } catch (err) {
      console.error('Erro ao consultar banco:', err);
      throw err;
    }
  }
}

module.exports = Database2;