<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
</div>
</div>
<footer id="footer">
<div class="container">
<?php if (!empty($this->options->ShowLinks) && in_array('footer', $this->options->ShowLinks)): ?>
<ul class="links">
<?php Links($this->options->IndexLinksSort); ?>
<?php if (FindContents('page-links.php', 'order', 'a', 1)): ?>
<li><a href="<?php echo FindContents('page-links.php', 'order', 'a', 1)[0]['permalink']; ?>">更多...</a></li>
<?php endif; ?>
</ul>
<?php endif; ?>
<p>&copy; <?php echo date('Y'); ?> <a href="<?php $this->options->siteUrl(); ?>"><?php $this->options->title(); ?></a>. Powered by <a href="http://www.typecho.org" target="_blank">Typecho</a> &amp; Initial.</p>
<?php if ($this->options->ICPbeian): ?>
<p><a href="http://beian.miit.gov.cn" class="icpnum" target="_blank" rel="noreferrer"><?php $this->options->ICPbeian(); ?></a></p>
<?php endif; if ($this->options->AjaxLoad): ?>
<input id="token" type="hidden" value="<?php echo Typecho_Widget::widget('Widget_Security')->getTokenUrl('Token'); ?>" readonly="readonly" />
<?php endif; ?>
</div>
</footer>
<?php if ($this->options->scrollTop || ($this->options->MusicSet && $this->options->MusicUrl)): ?>
<div id="cornertool">
<ul>
<?php if ($this->options->scrollTop): ?>
<li id="top" class="hidden"></li>
<?php endif; ?>
<?php if ($this->options->MusicSet && $this->options->MusicUrl): ?>
<li id="music" class="hidden">
<span><i></i></span>
<audio id="audio" data-src="<?php Playlist() ?>"<?php if ($this->options->MusicVol): ?> data-vol="<?php $this->options->MusicVol(); ?>"<?php endif; ?> preload="none"></audio>
</li>
<?php endif; ?>
</ul>
</div>
<?php endif; ?>
<?php
$libs=[
        'cf'=>[
            'jquery' => 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
            'swup' => 'https://cdnjs.cloudflare.com/ajax/libs/swup/4.8.2/Swup.umd.js',
            'highlightjs' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js',
            'highlightjs-theme' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css'
        ],
        'jd'=>[
            'jquery' => 'https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js',
            'swup' => 'https://cdn.jsdelivr.net/npm/swup@4.9.2/dist/Swup.umd.js',
            'highlightjs' => 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/highlight.min.js',
            'highlightjs-theme' => 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/styles/default.min.css'
        ]
    ];

if ($this->options->PjaxOption || $this->options->AjaxLoad){
    echo '<script src="'.$libs[$this->options->cjCDN]['jquery'].'"></script>';
}
if ($this->options->PjaxOption){
    echo '<script src="'.$libs[$this->options->cjCDN]['swup'].'"></script>';
}
if ($this->options->Highlight){
    $theme = $this->options->HighlightTheme ?: 'default';
    echo '<script src="'.$libs[$this->options->cjCDN]['highlightjs'].'"></script>';
    echo '<link rel="stylesheet" href="'.str_replace('/default.min.css', '/'.$theme.'.min.css', $libs[$this->options->cjCDN]['highlightjs-theme']).'">';
}
?>


<script src="<?php cjUrl('main.js') ?>"></script>
<?php $this->footer(); ?>
<?php if ($this->options->CustomContent): $this->options->CustomContent(); ?>

<?php endif; ?>
</body>
</html><?php if ($this->options->compressHtml): $html_source = ob_get_contents(); ob_clean(); print compressHtml($html_source); ob_end_flush(); endif; ?>