import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MDSpinner from "react-md-spinner";

import './App.css';

const useStyles = makeStyles(theme => ({
    '@global': {
        body: {
            backgroundColor: theme.palette.common.white,
        },
    },
    root: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: theme.palette.background.paper,
    },
    paper: {
        marginTop: theme.spacing(18),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    input: {
        marginTop: theme.spacing(8),
    },
    permawebifying: {
        margin: theme.spacing(3, 0, 2),
    }
}));

function Foot() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Powered By '}
            <Link color="inherit" href="https://www.arweave.org/">
                @Arweave
        </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const prefix = 'https://viewblock.io/arweave/tx/'
const service_url = 'http://127.0.0.1:1080/'

function forEach(txs) {
    const elements = [];
    txs.forEach((item) => {
        elements.push(
            <ListItem button component="a" href={prefix + item}>
                <Link color="inherit" href={prefix + item}>{item}</Link>
            </ListItem>
        )
    }
    )
    return elements

}

function getFetchStatus(fetchError) {
    if (fetchError !== undefined) {
        return <div>
            <Typography variant="body2" color="secondary" align="center">
                Permawebifying Service Access Failure
            </Typography>
            <Typography variant="body2" color="secondary" align="center">
                {fetchError}
            </Typography>
        </div>
    }
}

function getResult(result) {
    if (result !== undefined && result != null) {
        console.log("result:" + result)
        if (result.existedTxIds !== undefined) {
            return <List component="nav" aria-label="secondary mailbox folders" subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    Following Txs already contain this IPFS file
                   </ListSubheader>}>
                {forEach(result.existedTxIds)}
            </List>
        }
        if (result.error !== undefined) {
            return <div>
                <Typography variant="body2" color="secondary" align="center">
                    Fetching IPFS File Failure, double check provided hash
                </Typography>
                <Typography variant="body2" color="secondary" align="center">
                    {result.error}
                </Typography>
            </div>
        }
        if (result.newId !== undefined) {
            return <div>
                <Typography variant="body2" color="textSecondary" align="center">
                    Successful! Check following link after a few minutes`
                </Typography>
                <Link color="inherit" href={prefix + result.newId}>{result.newId}</Link>
            </div>
        }

    }
}

function App() {
    const classes = useStyles();
    const [result, setResult] = useState()
    const [fetchError, setFetchError] = useState()
    const [hash, setHash] = useState('')
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    function handleChange(e) {
        setHash(e.target.value)
        setResult({})
        setFetchError(undefined)
    }

    const handleClose = () => {
        setOpen(false);
    };

    async function permawebifying() {
        setIsLoading(true)
        setFetchError(undefined)
        setResult({})
        console.log("Send Post Request to service host")
        if (hash === '') {
            setOpen(true)
            return
        }
        let rawResponse
        try {
            rawResponse = await fetch(service_url, {
                method: 'POST',
                body: hash
            }).catch(e => { throw (e) })
        } catch (e) {
            console.log(e.toString())
            setFetchError(e.toString())
            return
        }finally{
            setIsLoading(false)
        }

        const result = await rawResponse.json()
        setResult(result)
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Typography variant="body2" color="textSecondary" align="center">
                    Use this tool to store IPFS files to Arweave chain
                </Typography>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="hash"
                    label="IPFS File Hash"
                    name="hash"
                    autoFocus
                    className={classes.input}
                    onChange={handleChange}
                />
                <Button
                    fullWidth
                    variant="contained"
                    disabled = {isLoading}
                    color="primary"
                    onClick={permawebifying}
                    className={classes.permawebifying}
                >
                    {isLoading ?<MDSpinner/> : "Permawebifying IPFS File"}
                </Button>
                {
                    getFetchStatus(fetchError)
                }
                {
                    getResult(result)
                }


                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Empty IPFS File Hash"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            IPFS hash is empty, please input a valid IPFS hash value
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
            <Box mt={8}>
                <Foot />
            </Box>
        </Container>
    );
}

export default App;
