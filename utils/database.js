const sql = require('mssql');
const dbConfig = require('C:/Users/Daniel/play/config/db_config.js');

class DatabaseHelper {
  static async conectar() {
    await sql.connect(dbConfig); 
  }

  static async desconectar() {
    await sql.close();
  }

  // Busca o token mais recente para um IdentificadorPremiado e Tipo
  static async buscarTokenPorIdentificadorETipo(identificadorPremiado, tipo = 'PHONE_VERIFICATION') {
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

  // Busca os 5 tokens mais recentes para depuração (sem filtro de tipo)
  static async buscarTokensRecentesPorIdentificador(identificadorPremiado) {
    try {
      await this.conectar();
      const result = await sql.query`
        SELECT TOP 1 * FROM TokenApp
        WHERE IdentificadorPremiado = ${identificadorPremiado}
        ORDER BY DataEmissao DESC
      `;
      await this.desconectar();
      return result.recordset;
    } catch (err) {
      console.error('Erro ao consultar banco:', err);
      throw err;
    }
  }

  // Busca os 5 tokens mais recentes para um IdentificadorPremiado e Tipo específico
  static async buscarTokensRecentesPorIdentificadorETipo(identificadorPremiado, tipo) {
    try {
      await this.conectar();
      const result = await sql.query`
        SELECT TOP 1 * FROM TokenApp
        WHERE IdentificadorPremiado = ${identificadorPremiado}
          AND Tipo = ${tipo}
        ORDER BY DataEmissao DESC
      `;
      await this.desconectar();
      return result.recordset;
    } catch (err) {
      console.error('Erro ao consultar banco:', err);
      throw err;
    }
  }
}

module.exports = DatabaseHelper;