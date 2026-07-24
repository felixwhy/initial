<?php
/**
 * 标签云
 *
 * @package custom
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->noindex = true;
$this->need('header.php');
Breadcrumbs($this); ?>
<article class="post">
<h1 class="post-title"><a href="<?php $this->permalink() ?>"><?php $this->title() ?></a></h1>
<div class="post-content">
<?php $this->content(); ?>
<style type="text/css">
.tag-cloud{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 16px;padding:10px 0;line-height:2}
.tag-cloud .tag-item{position:relative;display:inline-block;color:#666;text-decoration:none;border:0;transition:color .2s,transform .2s;-webkit-transition:color .2s,transform .2s}
.tag-cloud .tag-item:hover{color:#333!important;transform:translateY(-2px);-webkit-transform:translateY(-2px)}
.tag-cloud .tag-item::before{content:"";position:absolute;left:50%;bottom:100%;transform:translateX(-50%);-webkit-transform:translateX(-50%);border:5px solid transparent;border-top-color:rgba(0,0,0,.8);opacity:0;visibility:hidden;transition:opacity .2s;-webkit-transition:opacity .2s;pointer-events:none;z-index:10}
.tag-cloud .tag-item::after{content:attr(data-tip);position:absolute;left:50%;bottom:100%;transform:translateX(-50%) translateY(-6px);-webkit-transform:translateX(-50%) translateY(-6px);white-space:nowrap;padding:3px 8px;font-size:12px;line-height:1.4;color:#fff;background:rgba(0,0,0,.8);border-radius:3px;opacity:0;visibility:hidden;transition:opacity .2s,transform .2s;-webkit-transition:opacity .2s,-webkit-transform .2s;pointer-events:none;z-index:10}
.tag-cloud .tag-item:hover::before{opacity:1;visibility:visible}
.tag-cloud .tag-item:hover::after{opacity:1;visibility:visible;transform:translateX(-50%) translateY(-12px);-webkit-transform:translateX(-50%) translateY(-12px)}
</style>
<div class="tag-cloud">
<?php
$tags = $this->widget('Widget_Metas_Tag_Cloud', 'ignoreZeroCount=1&sort=name&desc=0');
$tagList = array();
$counts  = array();
while ($tags->next()) {
    $count = intval($tags->count);
    $tagList[] = array(
        'name'      => $tags->name,
        'permalink' => $tags->permalink,
        'count'     => $count
    );
    $counts[] = $count;
}
if (!empty($tagList)) {
    $min     = min($counts);
    $max     = max($counts);
    $minSize = 12; // 最少文章数的标签字号(px)
    $maxSize = 30; // 最多文章数的标签字号(px)
    foreach ($tagList as $tag) {
        if ($max == $min) {
            $size = ($minSize + $maxSize) / 2;
        } else {
            $size = $minSize + ($tag['count'] - $min) / ($max - $min) * ($maxSize - $minSize);
        }
        $tip = $tag['count'] . ' 篇文章';
        echo '<a class="tag-item" href="' . htmlspecialchars($tag['permalink']) . '" '
           . 'style="font-size:' . round($size, 1) . 'px;color:rgba(51,51,51,' . round(0.45 + ($tag['count'] - $min) / max(1, ($max - $min)) * 0.55, 2) . ')" '
           . 'data-tip="' . htmlspecialchars($tip) . '" '
           . 'title="' . htmlspecialchars($tag['name'] . '（' . $tip . '）') . '">'
           . htmlspecialchars($tag['name']) . '</a>' . PHP_EOL;
    }
} else {
    echo '<p>暂无标签</p>';
}
?>
</div>
</div>
</article>
<?php $this->need('comments.php'); ?>
</div>
<?php if (!$this->options->OneCOL): $this->need('sidebar.php'); endif; ?>
<?php $this->need('footer.php'); ?>
