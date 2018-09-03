# hubot-datasheets

A hubot script that links datasheets for electronic components from [Octopart](https://octopart.com/).

See [`src/datasheets.coffee`](src/datasheets.coffee) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-datasheets --save`

Then add **hubot-datasheets** to your `external-scripts.json`:

```json
[
  "hubot-datasheets"
]
```

You will also need to obtain an *API key* from [Octopart](https://octopart.com/api/register).
As soon as your registration is complete, store that in an enviromnment variable in your hubot script:

```bash
export HUBOT_OCTOPART_API_KEY=myapikey
```

## Sample Interaction

```
user1>> hubot datasheet LD1117
hubot>> Datasheet for **LD1117S25TR** (0.13€): http://datasheet.octopart.com/LD1117S25TR-STMicroelectronics-datasheet-38944308.pdf
```

## NPM Module

https://www.npmjs.com/package/hubot-datasheets

## To-Do List
- [ ] Handle thrown errors
- [ ] Functional testing
- [ ] Better behaviour for parts where the default sorting is not correct (e.g. TI CC1120)
