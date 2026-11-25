package com.bh.ideevision;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;

public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setStatusBarColor(0xFF0A0D1F);
        getWindow().setNavigationBarColor(0xFF0A0D1F);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(0xFF0A0D1F);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Bridge(), "Android");
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(Locale.FRENCH);
                Voice offlineFrench = null;
                if (tts.getVoices() != null) {
                    for (Voice voice : tts.getVoices()) {
                        if ("fr".equals(voice.getLocale().getLanguage())
                                && !voice.isNetworkConnectionRequired()) {
                            offlineFrench = voice;
                            break;
                        }
                    }
                }
                if (offlineFrench != null) {
                    tts.setVoice(offlineFrench);
                    tts.setSpeechRate(0.95f);
                    ttsReady = true;
                } else {
                    // L'application reste entièrement utilisable sans voix réseau.
                    ttsReady = false;
                }
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { done(); }
                    @Override public void onError(String id) { done(); }
                });
            }
        });
        web.loadUrl("file:///android_asset/index.html");
    }

    private void done() {
        runOnUiThread(() -> web.evaluateJavascript("window.ttsDone&&window.ttsDone()", null));
    }

    private class Bridge {
        @JavascriptInterface
        public void speak(String t) {
            if (ttsReady) tts.speak(t, TextToSpeech.QUEUE_FLUSH, null, "u" + System.nanoTime());
            else done();
        }
        @JavascriptInterface
        public void stop() { if (tts != null) tts.stop(); }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.onBack?window.onBack():false", v -> {
            if (!"true".equals(v)) finish();
        });
    }

    @Override
    protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
