@{
    staging    = @(
        @{ Name = 'stage-web-01'; Tier = 'Web' }
        @{ Name = 'stage-worker-01'; Tier = 'Worker' }
    )
    production = @(
        @{ Name = 'prod-web-01'; Tier = 'Web' }
        @{ Name = 'prod-web-02'; Tier = 'Web' }
        @{ Name = 'prod-worker-01'; Tier = 'Worker' }
    )
}
