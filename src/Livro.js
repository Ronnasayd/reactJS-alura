import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './components/inputCustomizado'
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';


class FormularioLivro extends Component {
    constructor() {
        super();
        this.state = {
            titulo: '',
            preco: '',
            autorId: '',
        };
        this.enviaForm = this.enviaForm.bind(this)
        this.setTitulo = this.setTitulo.bind(this)
        this.setPreco = this.setPreco.bind(this)
        this.setAutorId = this.setAutorId.bind(this)
    }
    enviaForm(event) {
        event.preventDefault();
        console.log(event)
        $.ajax({
            url: "http://cdc-react.herokuapp.com/api/livros",
            contentType: "application/json",
            dataType: "json",
            type: "post",
            data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autor: this.state.autorId }),
            success: function (novaListagem) {
                // disparar um aviso geral de novaListagem disponivel
                PubSub.publish('atualiza-lista-livros', novaListagem)
                this.setState({ titulo: '', preco: '', autorId: '' })
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
    setTitulo(event) {
        this.setState({ titulo: event.target.value })
    }
    setPreco(event) {
        this.setState({ preco: event.target.value })
    }
    setAutorId(event) {
        this.setState({ autorId: event.target.value })
    }
    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado label="titulo" id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} />
                    <InputCustomizado label="preco" id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} />

                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select value={this.state.autorId} name="autorId" id="autorId" onChange={this.setAutorId}>
                            <option value="">Selecione Autor</option>
                            {this.props.autores.map(function (autor) {
                                return <option value={autor.id}>{autor.nome}</option>
                            })}
                        </select>
                    </div>

                    <div className="pure-control-group">
                        <label></label>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>

            </div>

        );
    }
}

class TabelaLivros extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Preco</th>
                            {/* <th>Autor</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.lista.map((livro) => {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.preco}</td>
                                    {/* <td>{livro.autor}</td> */}
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



export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = {
            lista: [
            ],
            autores: [],
        };
        this.atualizaListagem = this.atualizaListagem.bind(this)
    }

    componentDidMount() {
        $.ajax({
            url: "http://cdc-react.herokuapp.com/api/livros",
            dataType: "json",
            success: function (response) {
                this.setState({ lista: response });
            }.bind(this)
        });

        $.ajax({
            url: "http://cdc-react.herokuapp.com/api/autores",
            dataType: "json",
            success: function (response) {
                this.setState({ autores: response });
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livros', function (topico, novaLista) {
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
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivros lista={this.state.lista} />
                </div>

            </div>
        )
    }
}