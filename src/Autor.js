import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './components/inputCustomizado'
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioAutor extends Component {
    constructor() {
        super();
        this.state = {
            nome: '',
            email: '',
            senha: '',
        };
        this.enviaForm = this.enviaForm.bind(this)
    }
    enviaForm(event) {
        event.preventDefault();
        console.log(event)
        $.ajax({
            url: "http://cdc-react.herokuapp.com/api/autores",
            contentType: "application/json",
            dataType: "json",
            type: "post",
            data: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha }),
            success: function (novaListagem) {
                // disparar um aviso geral de novaListagem disponivel
                PubSub.publish('atualiza-lista-autores', novaListagem)
                this.setState({ nome: '', email: '', senha: '' })
            }.bind(this),

            error: function (resposta) {
                if (resposta.status === 400) {
                    // recuperar quais foram os erros
                    // exibir a mensagem de erro no campo
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function () {
                PubSub.publish("limpa-erros", {})
            }
        })
    }

    salvarAlteracao(nomeInput, evento) {
        let campoSendoAlterado = {};
        campoSendoAlterado[nomeInput] = evento.target.value;
        this.setState(campoSendoAlterado);
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado label="Nome" id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvarAlteracao.bind(this, 'nome')} />
                    <InputCustomizado label="Email" id="email" type="email" name="email" value={this.state.email} onChange={this.salvarAlteracao.bind(this, 'email')} />
                    <InputCustomizado label="Senha" id="senha" type="password" name="senha" value={this.state.senha} onChange={this.salvarAlteracao.bind(this, 'senha')} />

                    <div className="pure-control-group">
                        <label></label>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>

            </div>

        );
    }
}

class TabelaAutores extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.lista.map((autor) => {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = {
            lista: [
            ],
        };
        this.atualizaListagem = this.atualizaListagem.bind(this)
    }

    componentDidMount() {
        $.ajax({
            url: "http://cdc-react.herokuapp.com/api/autores",
            dataType: "json",
            success: function (response) {
                this.setState({ lista: response });
            }.bind(this)
        });
        PubSub.subscribe('atualiza-lista-autores', function (topico, novaLista) {
            this.setState({ lista: novaLista })
        }.bind(this));
    }
    atualizaListagem(novaLista) {
        this.setState({ lista: novaLista })
    }
    render() {
        return (

            <div>
                <div className="header">
                    <h1>Cadastro de Autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor />
                    <TabelaAutores lista={this.state.lista} />
                </div>

            </div>
        );
    }
}