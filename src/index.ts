import parser from 'cron-parser'
import fetchEvents from './fetchEvents'
import moment from 'moment'
import shell from 'shelljs'

const SCRIPTS_LOCATION = `${process.cwd()}/src/scripts`
const BLOCK_SCRIPT = `${SCRIPTS_LOCATION}/block.sh`
const UNBLOCK_SCRIPT = `${SCRIPTS_LOCATION}/unblock.sh`

// Helpers
const prettyFormat = (dt) => moment(dt).format('MMMM Do, h:mm:ss a')
const cronFormat = (dt) => moment(dt).format('m H D M')
const genCronCmd = (time, path) =>
    `sudo crontab -l | { cat; echo "${time} * ${path}"; } | crontab -`

const main = async () => {
    const events = await fetchEvents()

    /**
     * Creating the cronjobs. Note that the jobs must be run as
     * the root user in order to edit the hosts file. Note also
     * that the root user has a _separate_ crontab than other users.
     */
    events.items.forEach((event) => {
        // Print event information
        console.log('Name: ', event.summary)
        console.log('Start: ', prettyFormat(event.start.dateTime))
        console.log('End: ', prettyFormat(event.end.dateTime))
        console.log('----------------')

        // Create the blocking job
        const start = cronFormat(event.start.dateTime)
        shell.exec(genCronCmd(start, BLOCK_SCRIPT))

        // Create the unblocking job
        const end = cronFormat(event.end.dateTime)
        shell.exec(genCronCmd(end, UNBLOCK_SCRIPT))
    })
}

main()
