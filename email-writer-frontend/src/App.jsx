import { useState } from 'react'
import './App.css'
import { 
  Container, 
  TextField, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import axios from 'axios'

function App() {
  const [emailContent, setEmailContent] = useState('')
  const [tone, setTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedReply, setGeneratedReply] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try{
       const response=await axios.post('http://localhost:8080/api/email/generate',{
        tone,
        emailContent
       });
       setGeneratedReply(typeof response.data==='string' ?
        response.data : JSON.stringify(response.data)
       );   
    }catch(error){
      
    }finally{
      setLoading(false)
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply)
    setCopySuccess(true)
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 6 }}>

        {/* PAGE HEADER */}
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 4,
            color: 'primary.main',
            letterSpacing: 0.5
          }}
        >
          Email Reply Generator
        </Typography>

        {/* INPUT CARD */}
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            mb: 4,
            background: '#f9fbff'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Enter Email Details
          </Typography>

          <Box display="flex" flexDirection="column" gap={3}>

            <TextField
              fullWidth
              multiline
              rows={8}
              variant="outlined"
              label="✉️ Paste your email here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Tone (Optional)</InputLabel>
              <Select
                value={tone}
                label="Tone (Optional)"
                onChange={(e) => setTone(e.target.value)}
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Casual">Casual</MenuItem>
                <MenuItem value="Friendly">Friendly</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={!emailContent || loading}
              size="large"
              sx={{ 
                py: 1.5, 
                fontSize: '1rem',
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              {loading 
                ? <CircularProgress size={26} color="inherit" /> 
                : 'Generate Reply'
              }
            </Button>

          </Box>
        </Paper>

        {/* OUTPUT CARD */}
        {generatedReply && (
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              background: '#ffffff'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Generated Reply
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={generatedReply}
                inputProps={{ readOnly: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />

              <Button 
                variant="outlined"
                onClick={handleCopy}
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                📋 Copy to Clipboard
              </Button>
            </Box>
          </Paper>
        )}

        {/* COPY SUCCESS SNACKBAR */}
        <Snackbar 
          open={copySuccess} 
          autoHideDuration={2000} 
          onClose={() => setCopySuccess(false)}
        >
          <Alert severity="success">
            Copied to clipboard!
          </Alert>
        </Snackbar>

      </Container>
    </>
  )
}

export default App
