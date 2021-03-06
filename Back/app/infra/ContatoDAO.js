function ContatoDAO(connection){
	this._connection = connection;
}

//---------------Querys de Contatos ---------------//
//Lista os Contatos com base em uma String (nome ou telefone) digitada.
ContatoDAO.prototype.listarContato = function(contato, callback){
	this._connection.query(`SELECT pessoa.cod_pessoa, pessoa.nome AS nomePessoa, GROUP_CONCAT(telefone.fone SEPARATOR ' / ') AS telefones FROM pessoa LEFT JOIN telefone ON pessoa.cod_pessoa = telefone.cod_pessoa WHERE pessoa.nome LIKE '%${contato}%' OR telefone.fone LIKE '%${contato}%' GROUP BY cod_pessoa`, callback);
}

//Lista as informações de uma Pessoa e seus Telefones.
ContatoDAO.prototype.listarContatoInfo = function(cod_pessoa, callback){
	this._connection.query(`SELECT pessoa.*, telefone.*, CASE WHEN telefone.tipo = "C" THEN "Casa" WHEN telefone.tipo = "T" THEN "Trabalho" WHEN telefone.tipo = "M" THEN "Móvel" END AS "tipoII" FROM pessoa INNER JOIN telefone ON pessoa.cod_pessoa = telefone.cod_pessoa WHERE pessoa.cod_pessoa = ${cod_pessoa} ORDER BY telefone.cod_telefone`, callback);
}

//Lista os Contatos de uma Instituicao Responsavel.
ContatoDAO.prototype.listarContatoInstituicao = function(cod_instituicao, callback){
	this._connection.query(`SELECT pessoa.cod_pessoa, contato.cod_contato, pessoa.nome, contato.cargo, contato.obs FROM instituicao_resp INNER JOIN contato ON instituicao_resp.cod_instituicao = contato.cod_instituicao INNER JOIN pessoa ON contato.cod_pessoa = pessoa.cod_pessoa WHERE instituicao_resp.cod_instituicao = ${cod_instituicao}`, callback);
}

//Lista os Contatos de uma Empresa.
ContatoDAO.prototype.listarContatoEmpresa = function(cnpj_empresa, callback){
	this._connection.query(`SELECT pessoa.cod_pessoa, contato.cod_contato, pessoa.nome, contato.cargo, contato.obs FROM empresa INNER JOIN contato ON empresa.cnpj_empresa = contato.cnpj_empresa INNER JOIN pessoa ON contato.cod_pessoa = pessoa.cod_pessoa WHERE empresa.cnpj_empresa = ${cnpj_empresa}`, callback);
}

//Lista os Contatos de um Pontos de Presença.
ContatoDAO.prototype.listarContatoPonto = function(cod_gesac, callback){
	this._connection.query(`SELECT pessoa.cod_pessoa, contato.cod_contato, pessoa.nome, contato.cargo, contato.obs FROM gesac INNER JOIN contato ON gesac.cod_gesac = contato.cod_gesac INNER JOIN pessoa ON contato.cod_pessoa = pessoa.cod_pessoa WHERE gesac.cod_gesac = ${cod_gesac}`, callback);
}

//Lista as informações de um Contatos.
ContatoDAO.prototype.listarContatoDados = function(cod_contato, callback){
	this._connection.query(`SELECT contato.cargo, contato.obs, pessoa.nome FROM contato INNER JOIN pessoa ON contato.cod_pessoa = pessoa.cod_pessoa WHERE cod_contato = ${cod_contato}`, callback);
}

//Lista Contato concatenado com base no cod_contato.
ContatoDAO.prototype.listarContatoLog = function(cod_contato, callback){
	this._connection.query(`SELECT CONCAT_WS('', cod_contato,";", cod_pessoa,";", cnpj_empresa,";", cod_instituicao,";", cod_gesac,";", cargo,";", obs) AS espelho FROM contato WHERE cod_contato = ${cod_contato}`, callback);
}

//---------------Querys de Telefones ---------------//
//Lista Telefone concatenado com base no cod_telefone e cod_pessoa.
ContatoDAO.prototype.listarTelefoneLog = function(cod_telefone, cod_pessoa, callback){
	this._connection.query(`SELECT CONCAT_WS('', cod_telefone,";", cod_pessoa,";", fone,";", tipo,";", email) AS espelho FROM telefone WHERE cod_telefone = ${cod_telefone} AND cod_pessoa = ${cod_pessoa}`, callback);
}

//---------------Querys de Pessoas ---------------//
//Lista Pessoa concatenado com base no cod_pessoa.
ContatoDAO.prototype.listarPessoaLog = function(cod_pessoa, callback){
	this._connection.query(`SELECT CONCAT_WS('', cod_pessoa,";", nome) AS espelho FROM pessoa WHERE cod_pessoa = ${cod_pessoa}`, callback);
}

module.exports = () => {
	return ContatoDAO;
};