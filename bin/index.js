#!/usr/bin/env node

const axios = require('axios')
const yargs = require('yargs')
const csv2json = require('csvjson-csv2json')
const chalk = require('chalk')
const boxen = require('boxen')

const url = 'https://elpais.com/infografias/2020/02/coronavirus-europa/graficos-d3/data/coronavirus_cases.csv'

const options = yargs
  .usage('Uso: -p <pais>')
  .option('p', { alias: 'pais', describe: 'Nombre del país (en español)', type: 'string', demandOption: false })
  .locale('es').argv

const getData = async url => {
  try {
    const response = await axios.get(url)
    const json = csv2json(response.data, { parseNumbers: true })
    const country = capitalize(options.pais)
    const found = filterDataByCountry(json, country)

    if (!found.length) return drawBox(country)
    drawBox(country, found[0].infectados, found[0].curados, found[0].muertos)
  } catch (error) {
    console.log(error)
  }
}

const capitalize = (country) => {
  if (!country) return 'España'
  const words = country.split(' ')
  if (words.length <= 2) {
    return words.map(w => w.substring(0, 1).toUpperCase() + w.substring(1)).join(' ')
  } else {
    words[0] = words[0][0].toUpperCase() + words[0].toLowerCase().slice(1)
    words[words.length - 1] = words[words.length - 1][0].toUpperCase() +
      words[words.length - 1].toLowerCase().slice(1)
    return words.join(' ')
  }
}

const filterDataByCountry = (json, country) => json.filter(
  ({ place }) => place === country
)

const drawBox = (country, confirmed, recovered, deaths) => {
  const options = {
    padding: 1,
    margin: 1,
    borderStyle: 'bold',
    borderColor: 'red',
    align: 'center'
  }

  if (!confirmed) {
    const header = `${`No se han reportado casos en ${chalk.bold(country)}`}`
    console.log(boxen(`${header}`, options))
    return false
  }

  const content = {
    header: `${chalk.bold.underline(`Casos en ${country}`)}`,
    confirmed: `Confirmados: ${chalk.yellow.bold(confirmed)}`,
    recovered: `Recuperados: ${chalk.green.bold(recovered)}`,
    deaths: `Muertos: ${chalk.red.bold(deaths)}`
  }

  console.log(boxen(
    `${content.header}\n\n${content.confirmed} ${content.recovered} ${content.deaths}`,
    options))
}
getData(url)
